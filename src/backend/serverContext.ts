import { type GameState, type GameId, type PlayerId, initGameState } from 'src/agnostic/gameState.ts';

// record of game ids to games
export interface ServerContext {
	[key: GameId]: ServerGameContext;
}

export interface ServerGameContext {
	// state of the game, should by in sync
	// with all clients connected to this game
	gameState: GameState;
	// state specific to the server for this
	// game instance
	serverState: ServerState;
}

export interface ServerState {
	players: ServerPlayersState;
}

export interface ServerPlayersState {
	[key: PlayerId]: ServerPlayerState;
}

export interface ServerPlayerState {
	id: string;
	pass: string;
	connected: boolean;
}

export function initServerState(): ServerState {
	return {
		players: {},
	};
}

export function initServerContext(): ServerContext {
	return {};
}

export function initServerGameContext(gameId: GameId): ServerGameContext {
	return {
		gameState: initGameState(gameId),
		serverState: initServerState(),
	};
}
