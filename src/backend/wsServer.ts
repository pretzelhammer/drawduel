import { type Server as HttpServer } from 'http';
import { Server as WsServer, type ServerOptions } from 'socket.io';
import { log } from 'src/backend/log.ts';
import {
	type ServerContext,
	initServerContext,
	type ServerGameContext,
	type ServerPlayerState,
	initServerGameContext,
} from 'src/backend/serverContext.ts';
import {
	type GameEvent,
	type GamePlayer,
	type JoinEvent,
	type JoinTeamEvent,
	type LeftEvent,
	type NewRoundEvent,
	type PlayerDisconnectEvent,
	type PlayerReconnectEvent,
	advance,
	canAdvance,
	nextGamePhase,
	type GameId,
	type PlayerId,
	type TeamId,
	RoundPhaseType,
	ChangeRoundPhaseEvent,
} from 'src/agnostic/gameState.ts';
import { type ServerEvent, type ClientError, type ClientEvent } from 'src/agnostic/events.ts';
import { validGameId, validName, validPass, validPlayerId } from 'src/agnostic/validation';
import { type Maybe } from 'src/agnostic/types.ts';
import { pickRandomItem, randomWordChoices } from 'src/agnostic/random.ts';
import { type Ms, msUntil, now, secondsFromNow, secondsToMs } from 'src/agnostic/time.ts';
import { isFunction } from 'lodash-es';
import {
	EASY_WORD_WAIT_SECS,
	HARD_WORD_WAIT_SECS,
	HAS_LIGHTNING_ROUND,
	MAX_ROUND_ID,
	PRE_PLAY_WAIT_SECS,
	UNREADY_PLAYER_WAIT_SECS,
	WORD_CHOICE_WAIT_SECS,
} from 'src/agnostic/constants.ts';

/**
 * README
 *
 * There are several properties of game events that you need to
 * be aware of to understand the code below.
 *
 * Server events vs Client events
 * - malicious (or buggy) clients can generate game events that
 *   they may not have the permission to generate, for example:
 *   Client A may generate a game event to change Client B's
 *   player name, which obviously should not be allowed, and as
 *   such we always check that the client who generated a particular
 *   game event has the permission to do so before we attempt to
 *   execute it
 * - server has the authority to generate any game event, so we
 *   don't need to do any permission checks for server generated
 *   game events
 *
 * Response events
 * - generally the server just checks, executes, and emits events
 *   from one client to all other clients, and that's how the game
 *   works for the most part, but sometimes a client event requires
 *   the server to generate several follow-up events as a response,
 *   and these are called response events. only client events can
 *   trigger response events, response events cannot trigger more
 *   response events.
 *
 * Checked events vs Unchecked events
 * - before we attempt to execute an event, we first check to see
 *   if that event is even executable on the current game state,
 *   and if it is we refer to it as a checked event, otherwise it
 *   is an unchecked event
 *
 * Executed events vs Unexecuted events
 * - after an event has been checked, it can be executed, which means
 *   we apply it to the server game state, once it has been executed
 *   it is called an executed event, otherwise it is an unexecuted
 *   event
 *
 * Emitted events vs Unemitted events
 * - after an event has been checked and executed
 *
 * Server Event --> Checked --> Executed --> Emitted
 *
 * Client Event --> hasPermission --> Checked --> Executed --> Emitted
 *                                                   |
 *                                                   V
 *                                               hasResponse --> Response Events
 *
 * Response Event --> Checked --> Executed --> Emitted
 */

const wsOptions: Partial<ServerOptions> = {};

/**
 * returns team with least amount of players
 */
function smallestTeam(serverGameContext: ServerGameContext): TeamId {
	const gameState = serverGameContext.gameState;
	const teamIds = Object.keys(gameState.teams);
	if (teamIds.length === 0) {
		return '1';
	}
	let minPlayers = Number.MAX_SAFE_INTEGER;
	let minTeamId: TeamId = '1';
	for (let teamId of teamIds) {
		const teamPlayerCount = Object.keys(gameState.teams[teamId].players).length;
		if (teamPlayerCount < minPlayers) {
			minPlayers = teamPlayerCount;
			minTeamId = teamId;
		}
	}
	return minTeamId;
}

/**
 * returns unchecked unexecuted unemitted events
 */
function distributeAcrossTeams(playerIds: PlayerId[], teamCount: number): JoinTeamEvent[] {
	const joinTeamEvents: JoinTeamEvent[] = [];
	let teamIdInt = 0;
	for (let playerId of playerIds) {
		joinTeamEvents.push({
			type: 'join-team',
			data: {
				id: playerId,
				team: `${teamIdInt + 1}`,
			},
		});
		teamIdInt += 1;
		teamIdInt %= teamCount;
	}
	return joinTeamEvents;
}

/**
 * returns unchecked unexecuted unemitted events
 */
function rebalanceTeams(serverGameContext: ServerGameContext): JoinTeamEvent[] {
	const gameState = serverGameContext.gameState;
	const playerIds: PlayerId[] = Object.keys(gameState.players);
	const playerCount = playerIds.length;

	if (playerCount <= 3) {
		// 1 team, 1-3 players
		return distributeAcrossTeams(playerIds, 1);
	} else if (playerCount >= 4 && playerCount <= 5) {
		// 2 teams, 2-3 players each
		return distributeAcrossTeams(playerIds, 2);
	} else if (playerCount >= 6 && playerCount <= 7) {
		// 3 teams, 2-3 players each
		return distributeAcrossTeams(playerIds, 3);
	} else if (playerCount >= 8 && playerCount <= 20) {
		// 4 teams, 2-5 players each
		return distributeAcrossTeams(playerIds, 4);
	} else if (playerCount >= 21 && playerCount <= 25) {
		// 5 teams, 4-5 players each
		return distributeAcrossTeams(playerIds, 5);
	} else if (playerCount >= 26 && playerCount <= 30) {
		// 6 teams, 4-5 players each
		return distributeAcrossTeams(playerIds, 6);
	} else if (playerCount >= 21 && playerCount <= 35) {
		// 7 teams, 4-5 players each
		return distributeAcrossTeams(playerIds, 7);
	} else if (playerCount >= 36 && playerCount <= 40) {
		// 8 teams, 4-5 players each
		return distributeAcrossTeams(playerIds, 8);
	} else if (playerCount >= 41 && playerCount <= 90) {
		// 9 teams, 4-10 players each
		return distributeAcrossTeams(playerIds, 9);
	} else {
		throw new Error(`TOO MANY PLAYERS ${playerCount}`);
	}
}

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
 * checks if the player that produced this event has
 * the permission to do so
 * @param gameEvent an unchecked unexecuted unemitted event
 */
function hasPermission(playerId: PlayerId, serverGameContext: ServerGameContext, gameEvent: GameEvent): boolean {
	const gameState = serverGameContext.gameState;
	const player: Maybe<GamePlayer> = gameState.players[playerId];
	if (!player) {
		return false;
	}
	if (gameEvent.type === 'join') {
		// only server can issue this event
		// issues in response to player connecting
		return false;
	} else if (gameEvent.type === 'left') {
		// only server can issue this event
		// issues in response to player disconnecting
		return false;
	} else if (gameEvent.type === 'inc-player-score') {
		// atm we have a button that allows players
		// to increase their own score but it's just for
		// testing since that's obviously nonsense from
		// a game perspective, the only thing that should have
		// to power to increase or decrease scores is the server
		// so we may change this later
		return playerId === gameEvent.data.id;
	} else if (gameEvent.type === 'name') {
		// players can only change their own names
		return playerId === gameEvent.data.id;
	} else if (gameEvent.type === 'game-phase') {
		// players can never change the game phase,
		// only the server can issue this game event
		return false;
	} else if (gameEvent.type === 'join-team') {
		// right now server controls which players are
		// on which teams, we might change this in the
		// future if we can figure out how to keep the
		// team sizes balanced while giving players
		// the freedom to switch teams
		return false;
	} else if (gameEvent.type === 'ready') {
		// players can only ready themselves
		return playerId === gameEvent.data;
	} else if (gameEvent.type === 'reconnect') {
		// only server can issue this event
		return false;
	} else if (gameEvent.type === 'disconnect') {
		// only server can issue this event
		return false;
	} else if (gameEvent.type === 'timer') {
		// only server can issue this event
		return false;
	} else if (gameEvent.type === 'new-round') {
		// only server can issue this event
		return false;
	} else if (gameEvent.type === 'round-phase') {
		// only server can issue this event
		return false;
	}
	return true;
}

/**
 * checks if given game event is executable on the given server game state
 * @param gameEvent an unchecked event
 */
function canAdvanceServerGame(serverGameContext: ServerGameContext, gameEvent: GameEvent): boolean {
	return canAdvance(serverGameContext.gameState, gameEvent);
}

/**
 * executes the game event, i.e. applies it to the server game state
 * @param gameEvent a checked unexecuted event
 */
function advanceServerGame(serverGameContext: ServerGameContext, gameEvent: GameEvent) {
	const currentGameState = serverGameContext.gameState;
	const nextGameState = advance(currentGameState, gameEvent);
	serverGameContext.gameState = nextGameState;
}

/**
 * returns unchecked unexecuted unemitted events
 */
function nextRoundEvents(serverGameContext: ServerGameContext, delayedEmit: DelayedEventEmitter): GameEvent[] {
	// const nextRoundEvents: GameEvent[] = [];
	const drawers = selectDrawersForRound(serverGameContext);
	const chooser = pickRandomItem(drawers);
	const choices = randomWordChoices();
	const newRound: NewRoundEvent = {
		type: 'new-round',
		data: {
			drawers,
			chooser,
			choices,
		},
	};
	return [newRound];
}

/**
 * returns unchecked unexecuted unemitted events
 */
function nextPhaseEvents(serverGameContext: ServerGameContext, delayedEmit: DelayedEventEmitter): GameEvent[] {
	const gameState = serverGameContext.gameState;
	const currentPhase = gameState.phase;
	const currentRoundId = gameState.round;
	const nextPhaseEvents: GameEvent[] = [];
	if (currentPhase === 'pre-game') {
		nextPhaseEvents.push({
			type: 'game-phase',
			data: nextGamePhase(serverGameContext.gameState.phase),
		});
		// create first round
		nextPhaseEvents.push(...nextRoundEvents(serverGameContext, delayedEmit));
	} else if (currentPhase === 'rounds' && currentRoundId < MAX_ROUND_ID) {
		// create next round
		nextPhaseEvents.push(...nextRoundEvents(serverGameContext, delayedEmit));
	} else {
		nextPhaseEvents.push({
			type: 'game-phase',
			data: nextGamePhase(serverGameContext.gameState.phase),
		});
	}
	return nextPhaseEvents;
}

/**
 * true if the game event causes the server to generate
 * additional game events, called response events
 * ONLY IF the game event caused a change in the game state
 * example: when a player readies, the server needs to set
 * and emit a timer update, and when the timer expires
 * or all players ready then game phase advances
 */
function hasResponse(serverGameContext: ServerGameContext, gameEvent: GameEvent): boolean {
	const gamePhase = serverGameContext.gameState.phase;
	if (gameEvent.type === 'ready') {
		// if players are readying it means
		// we need to set or update the
		// next-phase timer
		return true;
	} else if (gameEvent.type === 'join' && gamePhase === 'pre-game') {
		// player joining in pre-game phase triggers
		// a team rebalance
		return true;
	} else if (gameEvent.type === 'left' && gamePhase === 'pre-game') {
		// player leaving in pre-game phase triggers
		// a team rebalance
		return true;
	} else if (gameEvent.type === 'new-round') {
		// if new round is being created we need to set
		// timer for first round-phase
		return true;
	} else if (gameEvent.type === 'round-phase' && gameEvent.data !== 'post-round') {
		// all round phases that aren't post-round have an automatic timer
		// so we need to set one if we get this event
		return true;
	} else if (gameEvent.type === 'choose') {
		// when chooser chooses we immediately start pre-play round phase
		// without waiting for current timer to complete
		return true;
	}
	return false;
}

/**
 * returns unchecked unexecuted unemitted events
 * @param gameEvent a checked executed unemitted event
 */
function generateResponse(
	serverGameContext: ServerGameContext,
	gameEvent: GameEvent,
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	// only put unchecked unexecuted unemitted events here
	const responseEvents: GameEvent[] = [];
	// players can only ready in the pre-game,
	// rounds.post-round, or post-game phase
	if (gameEvent.type === 'ready') {
		const players = Object.values(serverGameContext.gameState.players);
		let readyPlayers = 0;
		let unreadyConnectedPlayers = 0;
		for (let player of players) {
			if (player.ready) {
				readyPlayers += 1;
			} else if (player.connected) {
				unreadyConnectedPlayers += 1;
			}
		}
		// clear current timer because we're either about to
		// immediately start the next game phase because all
		// players are ready OR we're going to re-calculate
		// the timer because new players have readied/disconnected
		clearTimeout(serverGameContext.serverState.timerId);
		if (unreadyConnectedPlayers === 0) {
			responseEvents.push(...nextPhaseEvents(serverGameContext, delayedEmit));
		} else {
			// auto-start next phase without waiting for all players to ready
			const fullDuration = secondsToMs(unreadyConnectedPlayers * UNREADY_PLAYER_WAIT_SECS);

			// if this is the first player to ready then set the
			// recalc timer from variable to now
			if (readyPlayers === 1) {
				serverGameContext.serverState.recalcTimerFrom = now();
			}

			// calc when the current phase should env / next phase should start
			const endsAt = serverGameContext.serverState.recalcTimerFrom + fullDuration;
			const remainingDuration = msUntil(endsAt);
			if (remainingDuration <= 0) {
				responseEvents.push(...nextPhaseEvents(serverGameContext, delayedEmit));
			} else {
				serverGameContext.serverState.timerId = delayedEmit((emit) => {
					clearTimeout(serverGameContext.serverState.timerId);
					const phaseEvents = nextPhaseEvents(serverGameContext, delayedEmit);
					const event = batch(executeServerGameEvents(serverGameContext, phaseEvents, delayedEmit));
					if (event) {
						emit(event);
					}
				}, remainingDuration);
				// notify players of when next phase auto-starts
				responseEvents.push({
					type: 'timer',
					data: endsAt,
				});
			}
		}
	} else if (gameEvent.type === 'join' || gameEvent.type === 'left') {
		// when players join and leave in the pre-game phase
		// we have to rebalance the teams to keep them roughly even
		const rebalanceEvents: JoinTeamEvent[] = rebalanceTeams(serverGameContext);
		responseEvents.push(...rebalanceEvents);
	} else if (gameEvent.type === 'new-round') {
		// set timer for choose-word phase to end
		const wordChoiceEndsAt = secondsFromNow(WORD_CHOICE_WAIT_SECS);
		serverGameContext.serverState.timerId = delayedEmit((emit) => {
			clearTimeout(serverGameContext.serverState.timerId);
			const prePlayEvent: ChangeRoundPhaseEvent = {
				type: 'round-phase',
				data: 'pre-play',
			};
			const event = batch(executeServerGameEvent(serverGameContext, prePlayEvent, delayedEmit));
			if (event) {
				emit(event);
			}
		}, msUntil(wordChoiceEndsAt));
		// notify players when next round phase begins
		responseEvents.push({
			type: 'timer',
			data: wordChoiceEndsAt,
		});
	} else if (gameEvent.type === 'round-phase' && gameEvent.data === 'pre-play') {
		// set timer for pre-play phase to end
		const prePlayEndsAt = secondsFromNow(PRE_PLAY_WAIT_SECS);
		serverGameContext.serverState.timerId = delayedEmit((emit) => {
			clearTimeout(serverGameContext.serverState.timerId);
			const playEvent: ChangeRoundPhaseEvent = {
				type: 'round-phase',
				data: 'play',
			};
			const event = batch(executeServerGameEvent(serverGameContext, playEvent, delayedEmit));
			if (event) {
				emit(event);
			}
		}, msUntil(prePlayEndsAt));
		// notify players when next round phase begins
		responseEvents.push({
			type: 'timer',
			data: prePlayEndsAt,
		});
	} else if (gameEvent.type === 'round-phase' && gameEvent.data === 'play') {
		// set timer for play phase to end
		let waitSeconds = EASY_WORD_WAIT_SECS;
		const currentRoundId = serverGameContext.gameState.round;
		const currentRound = serverGameContext.gameState.rounds[currentRoundId];
		if (currentRound.word.difficulty === 'hard') {
			waitSeconds = HARD_WORD_WAIT_SECS;
		}
		const playEndsAt = secondsFromNow(waitSeconds);
		serverGameContext.serverState.timerId = delayedEmit((emit) => {
			clearTimeout(serverGameContext.serverState.timerId);
			let phaseChangeEvent: GameEvent = {
				type: 'round-phase',
				data: 'post-round',
			};
			// if this is the last round, and we have no lightning round,
			// then we actually just want to jump ahead to the post-game
			// screen
			if (!HAS_LIGHTNING_ROUND && serverGameContext.gameState.round === MAX_ROUND_ID) {
				phaseChangeEvent = {
					type: 'game-phase',
					data: 'post-game',
				};
			}
			const event = batch(executeServerGameEvent(serverGameContext, phaseChangeEvent, delayedEmit));
			if (event) {
				emit(event);
			}
		}, msUntil(playEndsAt));
		// notify players when next round phase begins
		responseEvents.push({
			type: 'timer',
			data: playEndsAt,
		});
	} else if (gameEvent.type === 'choose') {
		// clear choose words timer, since word was chosen
		clearTimeout(serverGameContext.serverState.timerId);
		// immediately go to pre-play phase
		const prePlayEvent: ChangeRoundPhaseEvent = {
			type: 'round-phase',
			data: 'pre-play',
		};
		responseEvents.push(prePlayEvent);
	}
	return responseEvents;
}

/**
 * selects drawers
 */
function selectDrawersForRound(serverGameContext: ServerGameContext): PlayerId[] {
	const drawers = [];
	const teams = Object.values(serverGameContext.gameState.teams);
	for (let team of teams) {
		const playerIds = Object.keys(team.players);
		const eligiblePlayerIds: PlayerId[] = [];
		for (let playerId of playerIds) {
			const player = serverGameContext.gameState.players[playerId];
			if (player.ready && player.connected) {
				eligiblePlayerIds.push(playerId);
			}
		}
		if (eligiblePlayerIds.length >= 1) {
			drawers.push(pickRandomItem(eligiblePlayerIds));
		} else {
			drawers.push(pickRandomItem(playerIds));
		}
	}
	return drawers;
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

		const delayedEmitAll = withDelay(emitAll);

		// is this a new game?
		if (!serverContext[gameId]) {
			log(`creating new game ${gameId}`);
			// if not create new game
			serverContext[gameId] = initServerGameContext(gameId);
		} else {
			// check if this client is already connected
			// in another browser window
			const player: Maybe<GamePlayer> = serverContext[gameId].gameState.players[playerId];
			if (player && player.connected) {
				clientErrors.push('already-playing');
				emit({ type: 'client-error', data: clientErrors });
				socket.disconnect(true);
				return;
			}
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
			const smallestTeamId = smallestTeam(serverGameContext);
			const joinEvent: JoinEvent = { type: 'join', data: { id: playerId, name, team: smallestTeamId } };
			const serverEventToEmit = batch(executeServerGameEvent(serverGameContext, joinEvent, delayedEmitAll));
			if (serverEventToEmit) {
				emitAll(serverEventToEmit);
			}
		} else {
			// emit reconnected event for existing player
			const reconnectEvent: PlayerReconnectEvent = {
				type: 'reconnect',
				data: playerId,
			};
			const serverEventToEmit = batch(executeServerGameEvent(serverGameContext, reconnectEvent, delayedEmitAll));
			if (serverEventToEmit) {
				emitAll(serverEventToEmit);
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
				const leftEvent: LeftEvent = { type: 'left', data: playerId };
				// players can only leave in the pre-game phase of
				// the game
				if (canAdvanceServerGame(serverGameContext, leftEvent)) {
					const serverEventToEmit = batch(
						executeServerGameEvent(serverGameContext, leftEvent, delayedEmitAll),
					);
					if (serverEventToEmit) {
						emitAll(serverEventToEmit);
					}
				} else {
					// if player cannot leave, because we are past the
					// pre-game phase of the game, then mark them
					// as disconnected
					const disconnectEvent: PlayerDisconnectEvent = {
						type: 'disconnect',
						data: playerId,
					};
					const serverEventToEmit = batch(
						executeServerGameEvent(serverGameContext, disconnectEvent, delayedEmitAll),
					);
					if (serverEventToEmit) {
						emitAll(serverEventToEmit);
					}
				}
			}
		});

		// broadcasts game events from player to all
		// players in game, including back to player
		// who sent us this event
		socket.on('event', (clientEvent: ClientEvent) => {
			const serverEventToEmit = batch(
				executeClientEvent(playerId, serverGameContext, clientEvent, delayedEmitAll),
			);
			if (serverEventToEmit) {
				emitAll(serverEventToEmit);
			} else {
				log(`player ${playerId} in game ${gameId} sent weird event`, clientEvent);
			}
		});
	});
}

function withDelay(emit: EventEmitter): DelayedEventEmitter {
	return (eventOrCallback: ServerEvent | DelayedEventEmitterCallback, delay: Ms) => {
		if (isFunction(eventOrCallback)) {
			const callback: DelayedEventEmitterCallback = eventOrCallback;
			return setTimeout(() => {
				callback(emit);
			}, delay);
		} else {
			const event: ServerEvent = eventOrCallback;
			return setTimeout(() => {
				emit(event);
			}, delay);
		}
	};
}

export type EventEmitter = (event: ServerEvent) => void;
export type DelayedEventEmitterCallback = (emitter: EventEmitter) => void;
export type DelayedEventEmitter = (
	eventOrCallback: ServerEvent | DelayedEventEmitterCallback,
	delay: Ms,
) => NodeJS.Timeout;

/**
 * batches game events ready to be emitted
 * @param gameEvents checked executed unemitted events
 */
function batch(gameEvents: GameEvent[]): Maybe<ServerEvent> {
	if (gameEvents.length === 0) {
		return null;
	}
	if (gameEvents.length === 1) {
		return gameEvents[0];
	}
	return {
		type: 'batch',
		data: gameEvents,
	};
}

/**
 * returns checked executed unemitted events
 * @param gameEvents unchecked unexecuted unemitted events
 */
function executeServerGameEvents(
	serverGameContext: ServerGameContext,
	gameEvents: GameEvent[],
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	// tiny perf optimization
	if (gameEvents.length === 0) {
		return gameEvents;
	}
	const executedEvents: GameEvent[] = [];
	for (let gameEvent of gameEvents) {
		executedEvents.push(...executeServerGameEvent(serverGameContext, gameEvent, delayedEmit));
	}
	return executedEvents;
}

/**
 * returns checked executed unemitted events
 * @param gameEvent unchecked unexecuted unemitted events
 */
function executeServerGameEvent(
	serverGameContext: ServerGameContext,
	gameEvent: GameEvent,
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	// log('checking', gameEvent);
	const executedEvents: GameEvent[] = [];
	if (canAdvanceServerGame(serverGameContext, gameEvent)) {
		// log('executing', gameEvent);
		advanceServerGame(serverGameContext, gameEvent);
		executedEvents.push(gameEvent);
		if (hasResponse(serverGameContext, gameEvent)) {
			// log('getting response to', gameEvent);
			const responseEvents = generateResponse(serverGameContext, gameEvent, delayedEmit);
			executedEvents.push(...executeServerGameEvents(serverGameContext, responseEvents, delayedEmit));
		}
	}
	return executedEvents;
}

/**
 * returns checked executed unemitted events
 * @param serverEvent unchecked unexecuted unemitted event (could be batch event)
 */
function executeServerEvent(
	serverGameContext: ServerGameContext,
	serverEvent: ServerEvent,
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	// if batch event
	if (serverEvent.type === 'batch') {
		return executeServerGameEvents(serverGameContext, serverEvent.data, delayedEmit);
	}
	if (
		serverEvent.type === 'server-error' ||
		serverEvent.type === 'client-error' ||
		serverEvent.type === 'set-game-state'
	) {
		throw new Error(`server event type ${serverEvent.type} is not executable on the server`);
	}
	// if regular single game event
	return executeServerGameEvent(serverGameContext, serverEvent, delayedEmit);
}

/**
 * returns checked executed unemitted events
 * @param gameEvent unchecked unexecuted unemitted events
 */
function executeClientGameEvent(
	playerId: PlayerId,
	serverGameContext: ServerGameContext,
	gameEvent: GameEvent,
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	if (hasPermission(playerId, serverGameContext, gameEvent)) {
		// after checking permission we can treat the event
		// as a server event
		return executeServerGameEvent(serverGameContext, gameEvent, delayedEmit);
	}
	return [];
}

/**
 * returns checked executed unemitted events
 * @param gameEvent unchecked unexecuted unemitted events
 */
function executeClientGameEvents(
	playerId: PlayerId,
	serverGameContext: ServerGameContext,
	gameEvents: GameEvent[],
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	if (gameEvents.length === 0) {
		return gameEvents;
	}
	const executedEvents: GameEvent[] = [];
	for (let gameEvent of gameEvents) {
		if (hasPermission(playerId, serverGameContext, gameEvent)) {
			// after checking permission we can treat the event
			// as a server event
			executedEvents.push(...executeServerGameEvent(serverGameContext, gameEvent, delayedEmit));
		}
	}
	return executedEvents;
}

/**
 * returns checked executed unemitted events
 * @param clientEvent unchecked unexecuted unemitted event (could be batch event)
 */
function executeClientEvent(
	playerId: PlayerId,
	serverGameContext: ServerGameContext,
	clientEvent: ClientEvent,
	delayedEmit: DelayedEventEmitter,
): GameEvent[] {
	// if batch event
	if (clientEvent.type === 'batch') {
		return executeClientGameEvents(playerId, serverGameContext, clientEvent.data, delayedEmit);
	}
	// if regular single game event
	return executeClientGameEvent(playerId, serverGameContext, clientEvent, delayedEmit);
}
