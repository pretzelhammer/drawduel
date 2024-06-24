import { type Server as HttpServer } from 'http';
import { Server as WsServer, type ServerOptions } from 'socket.io';
import { log } from 'src/backend/log.ts';
import {
	type ServerContext,
	initServerContext,
	type ServerGameContext,
	type ServerPlayerState,
	initServerGameContext,
	ServerState,
} from 'src/backend/serverContext.ts';
import {
	GameEvent,
	GamePlayer,
	GameState,
	JoinEvent,
	LeftEvent,
	advance,
	canAdvance,
	type GameId,
	type PlayerId,
} from 'src/agnostic/gameState.ts';
import { type ServerEvent, type ClientError, ClientEvent, BatchEvent } from 'src/agnostic/events.ts';
import { validGameId, validName, validPass, validPlayerId } from 'src/agnostic/validation';
import { Maybe } from 'src/agnostic/types';

const wsOptions: Partial<ServerOptions> = {};

if (process.env.NODE_ENV === 'development') {
	wsOptions.cors = {
		origin: ['http://localhost:8888'],
	};
}

const serverContext: ServerContext = initServerContext();

function correctPass(gameId: GameId, playerId: PlayerId, pass: string): boolean {
	const serverGameContext: ServerGameContext = serverContext[gameId];
	// brand new game means brand new player, so pass is correct
	if (!serverGameContext) {
		return true;
	}

	const serverPlayerState: ServerPlayerState = serverGameContext.serverState.players[playerId];
	// brand new player, so pass is correct
	if (!serverPlayerState) {
		return true;
	}

	// existing player, must check pass is correct
	if (serverPlayerState.pass !== pass) {
		return false;
	}

	return true;
}

/**
 * checks if the player that produced this event had the permission
 * to do so
 */
function hasPermission(playerId: PlayerId, gameId: GameId, gameEvent: GameEvent): boolean {
	const gameState = serverContext[gameId].gameState;
	const player: Maybe<GamePlayer> = gameState.players[playerId];
	if (!player) {
		return false;
	}
	if (gameEvent.type === 'join') {
		// players can only join themselves
		return playerId === gameEvent.data.id;
	} else if (gameEvent.type === 'left') {
		// players can only leave themselves
		return playerId === gameEvent.data;
	} else if (gameEvent.type === 'inc-player-score') {
		// atm we have a button that allows players
		// to increase their own score but it's just for
		// testing since that's obviously nonsense from
		// a game perspective, the only thing that should have
		// to power to increase or decrease scores is the server
		// so we may change this later
		return playerId === gameEvent.data.id;
	} else if (gameEvent.type === 'change-player-name') {
		// players can only change their own names
		return playerId === gameEvent.data.id;
	} else if (gameEvent.type === 'change-game-phase') {
		// players can never change the game phase,
		// only the server can issue this game event
		return false;
	}
	return true;
}

/**
 * checks if given game event can advance the specific game on the server
 */
function canAdvanceServerGame(gameId: GameId, gameEvent: GameEvent): boolean {
	return canAdvance(serverContext[gameId].gameState, gameEvent);
}

/**
 * advances game state on the server given the game event
 */
function advanceServerGame(gameId: GameId, gameEvent: GameEvent) {
	const currentGameState = serverContext[gameId].gameState;
	const nextGameState = advance(currentGameState, gameEvent);
	serverContext[gameId].gameState = nextGameState;
}

interface HandshakeQuery {
	gameId?: GameId;
	playerId?: PlayerId;
	pass?: string;
	name?: string;
}

export function setupWsServer(httpServer: HttpServer) {
	const wsServer = new WsServer(httpServer, wsOptions);

	wsServer.on('connection', (socket) => {
		function emit(event: ServerEvent) {
			socket.emit('event', event);
		}

		let { gameId, playerId, pass, name }: HandshakeQuery = socket.handshake.query;

		const clientErrors: ClientError[] = [];
		if (!gameId) {
			clientErrors.push('missing-game-id');
		} else if (!validGameId(gameId)) {
			clientErrors.push('invalid-game-id');
		}
		if (!playerId) {
			clientErrors.push('missing-player-id');
		} else if (!validPlayerId(playerId)) {
			clientErrors.push('invalid-player-id');
		}
		if (!pass) {
			clientErrors.push('missing-pass');
		} else if (!validPass(pass)) {
			clientErrors.push('invalid-pass');
		}
		const trimmedName = (name || '').trim();
		if (!trimmedName) {
			clientErrors.push('missing-name');
		} else if (!validName(trimmedName)) {
			clientErrors.push('invalid-name');
		}

		if (clientErrors.length) {
			emit({ type: 'client-error', data: clientErrors });
			socket.disconnect(true);
			return;
		}

		// inform TS we've checked these vars
		// and know they are all defined
		gameId = gameId!;
		playerId = playerId!;
		pass = pass!;
		name = name!;

		if (!correctPass(gameId, playerId, pass)) {
			clientErrors.push('incorrect-pass');
			emit({ type: 'client-error', data: clientErrors });
			socket.disconnect(true);
			return;
		}

		function emitAll(event: ServerEvent) {
			wsServer.to(gameId!).emit('event', event);
		}

		// is this a new game?
		if (!serverContext[gameId]) {
			log(`creating new game ${gameId}`);
			// if not create new game
			serverContext[gameId] = initServerGameContext(gameId);
		}

		log(`player ${playerId} connected to game ${gameId}`);

		const serverGameContext: ServerGameContext = serverContext[gameId];

		// add player to our server state
		serverGameContext.serverState.players[playerId] = {
			id: playerId,
			pass,
			connected: true,
		};

		// is this a new player?
		if (!serverGameContext.gameState.players[playerId]) {
			// create and broadcast join event to all current players in game
			// except for the just connected player
			const joinEvent: JoinEvent = { type: 'join', data: { id: playerId, name, team: '1' } };
			if (canAdvanceServerGame(gameId, joinEvent)) {
				advanceServerGame(gameId, joinEvent);
				emitAll(joinEvent);
			}
		}

		// sync current state of the game with just connected player
		emit({ type: 'set-game-state', data: serverGameContext.gameState });

		// join just connected player to game room
		socket.join(gameId);

		socket.on('disconnect', (reason: string) => {
			log(`player ${playerId} disconnected from game ${gameId} because: ${reason}`);
			serverGameContext.serverState.players[playerId].connected = false;
			// delete game if we have no more active connections
			const deleteGame = !Object.values(serverGameContext.serverState.players).some((player) => player.connected);
			if (deleteGame) {
				log(`deleting game ${gameId} because last player left`);
				delete serverContext[gameId];
			} else {
				// notify other players that this player left
				const leftEvent: LeftEvent = { type: 'left', data: playerId };
				if (canAdvanceServerGame(gameId, leftEvent)) {
					advanceServerGame(gameId, leftEvent);
					emitAll(leftEvent);
				}
			}
		});

		// broadcasts game events from player to all
		// players in game, including back to player
		// who sent us this event
		socket.on('event', (clientEvent: ClientEvent) => {
			let gameEvents: GameEvent[] = [];
			if (clientEvent.type === 'batch') {
				gameEvents = clientEvent.data;
			} else {
				gameEvents.push(clientEvent);
			}
			let gameEventsToEmit = [];
			for (let gameEvent of gameEvents) {
				// check that the player who produced this event has the permission
				// to produce it, and check that it will advance the game state
				if (hasPermission(playerId, gameId, gameEvent) && canAdvanceServerGame(gameId, gameEvent)) {
					advanceServerGame(gameId, gameEvent);
					gameEventsToEmit.push(gameEvent);
					// this particular event has a small server side effect, hopefully
					// this is the only one that needs to do this, otherwise we need
					// to refactor the code below to make it more obvious that server
					// side effects can happen as a result of game events
					if (gameEvent.type === 'change-player-name' && gameEvent.data.id === playerId) {
						name = gameEvent.data.name;
					}
				} else {
					log(`player ${playerId} in game ${gameId} sent weird event`, gameEvent);
				}
			}
			if (gameEventsToEmit.length === 1) {
				emitAll(gameEventsToEmit[0]);
			} else if (gameEventsToEmit.length > 1) {
				let batchEvent: BatchEvent = {
					type: 'batch',
					data: gameEventsToEmit,
				};
				emitAll(batchEvent);
			}
		});

		// just some testing stuff
		socket.emit('message', 'Hello from server!');
		socket.on('message', (message) => {
			if (message === 'PING') {
				socket.emit('message', 'PONG');
			}
		});
	});
}
