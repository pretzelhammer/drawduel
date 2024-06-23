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
	GameState,
	JoinEvent,
	LeftEvent,
	advance,
	canAdvance,
	type GameId,
	type PlayerId,
} from 'src/agnostic/gameState.ts';
import { type ServerEvent, type ClientError } from 'src/agnostic/events.ts';
import { validGameId, validName, validPass, validPlayerId } from 'src/agnostic/validation';

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

function canAdvanceServerGame(gameId: GameId, gameEvent: GameEvent): boolean {
	return canAdvance(serverContext[gameId].gameState, gameEvent);
}

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

		function emitAll(event: GameEvent) {
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
		const gameState: GameState = serverGameContext.gameState;
		const serverState: ServerState = serverGameContext.serverState;

		// add player to our server state
		serverState.players[playerId] = {
			id: playerId,
			pass,
			connected: true,
		};

		// sync current state of the game with client
		emit({ type: 'set-game-state', data: gameState });

		// join game room
		socket.join(gameId);

		// is this a new player?
		if (!gameState.players[playerId]) {
			// create and broadcast join event to all players in game
			const joinEvent: JoinEvent = { type: 'join', data: { id: playerId, name } };
			advanceServerGame(gameId, joinEvent);
			emitAll(joinEvent);
		}

		socket.on('disconnect', (reason: string) => {
			log(`player ${playerId} disconnected from game ${gameId} because: ${reason}`);
			serverState.players[playerId].connected = false;
			// delete game if we have no more active connections
			const deleteGame = !Object.values(serverState.players).some((player) => player.connected);
			if (deleteGame) {
				log(`deleting game ${gameId} because last player left`);
				delete serverContext[gameId];
			} else {
				// notify other players that this player left
				const leftEvent: LeftEvent = { type: 'left', data: playerId };
				advanceServerGame(gameId, leftEvent);
				emitAll(leftEvent);
			}
		});

		// broadcasts game events from player to all
		// players in game, including back to player
		// who sent us this event
		socket.on('event', (gameEvent: GameEvent) => {
			if (canAdvanceServerGame(gameId, gameEvent)) {
				advanceServerGame(gameId, gameEvent);
				emitAll(gameEvent);
			} else {
				log(`player ${playerId} in game ${gameId} sent weird event`, gameEvent);
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
