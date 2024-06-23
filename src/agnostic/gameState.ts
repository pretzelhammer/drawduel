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
	// TODO implement
	return true;
}

export function advance(gameState: GameState, gameEvent: GameEvent): GameState {
	if (gameEvent.type === 'join') {
		gameState.players[gameEvent.data.id] = {
			...gameEvent.data,
			score: 0,
		};
		return gameState;
	} else if (gameEvent.type === 'left') {
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		// only remove player from game if their score is 0
		if (player && player.score === 0) {
			delete gameState.players[gameEvent.data];
		}
		return gameState;
	} else if (gameEvent.type === 'inc-player-score') {
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data.id];
		if (player) {
			player.score += gameEvent.data.score;
		}
		return gameState;
	}
	return gameState;
}
