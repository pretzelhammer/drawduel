import { Maybe } from 'src/agnostic/types';

export type PlayerId = string;
export type GameId = string;

/**
 * the state of the game, synced
 * between the server and all players
 */
export interface GameState {
	id: GameId;
	players: GamePlayers;
}

export interface GamePlayers {
	[key: PlayerId]: GamePlayer;
}

export interface GamePlayer {
	id: PlayerId;
	name: string;
	score: number;
}

/**
 * new player is joining the game
 */
export interface JoinEvent {
	type: 'join';
	data: {
		id: PlayerId;
		name: string;
	};
}

/**
 * player has left the game
 */
export interface LeftEvent {
	type: 'left';
	data: PlayerId;
}

/**
 * increase player's score
 */
export interface IncPlayerScore {
	type: 'inc-player-score';
	data: {
		id: PlayerId;
		score: number;
	};
}

/**
 * change player's name
 */
export interface ChangePlayerName {
	type: 'change-player-name';
	data: {
		id: PlayerId;
		name: string;
	};
}

/**
 * union type representing all possible types
 * of game events
 */
export type GameEvent = JoinEvent | LeftEvent | IncPlayerScore | ChangePlayerName;

export function initGameState(gameId: GameId): GameState {
	return {
		id: gameId,
		players: {},
	};
}

/**
 * check if we can produce the next game state using the given game event
 */
export function canAdvance(gameState: GameState, gameEvent: GameEvent): boolean {
	if (gameEvent.type === 'join') {
		// player can only join if they aren't already in the game
		return !gameState.players[gameEvent.data.id];
	} else if (gameEvent.type === 'left') {
		// player can only leave if they exist and have zero score
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		return player && player.score === 0;
	} else if (gameEvent.type === 'inc-player-score') {
		// can only increase the score of players who exist
		return !!gameState.players[gameEvent.data.id];
	} else if (gameEvent.type === 'change-player-name') {
		// can only change name of players who exist
		return !!gameState.players[gameEvent.data.id];
	}
	return true;
}

/**
 * produce the next game state using the given game event, doesn't
 * do any validation, assumes the game event has already been validated
 */
export function advance(gameState: GameState, gameEvent: GameEvent): GameState {
	if (gameEvent.type === 'join') {
		gameState.players[gameEvent.data.id] = {
			...gameEvent.data,
			score: 0,
		};
	} else if (gameEvent.type === 'left') {
		delete gameState.players[gameEvent.data];
	} else if (gameEvent.type === 'inc-player-score') {
		gameState.players[gameEvent.data.id].score += gameEvent.data.score;
	} else if (gameEvent.type === 'change-player-name') {
		gameState.players[gameEvent.data.id].name = gameEvent.data.name;
	}
	return gameState;
}
