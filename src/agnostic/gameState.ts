import { Maybe } from 'src/agnostic/types';

export type PlayerId = string;
export type GameId = string;

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

export interface JoinEvent {
	type: 'join';
	data: {
		id: PlayerId;
		name: string;
	};
}

export interface LeftEvent {
	type: 'left';
	data: PlayerId;
}

export interface IncPlayerScore {
	type: 'inc-player-score';
	data: {
		id: PlayerId;
		score: number;
	};
}

export type GameEvent = JoinEvent | LeftEvent | IncPlayerScore;

export function initGameState(gameId: GameId): GameState {
	return {
		id: gameId,
		players: {},
	};
}

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
	}
	return true;
}

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
	}
	return gameState;
}
