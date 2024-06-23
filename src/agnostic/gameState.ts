import { parseGameId } from 'src/frontend/game/utils/parsing.ts';

export type PlayerId = string;
export type GameId = string;

export interface GameState {
	id: GameId;
	// TODO add more stuff
}

export interface GameEvent {
	// TODO add more stuff
}

export function initGameState(): GameState {
	return {
		id: parseGameId(),
	};
}
