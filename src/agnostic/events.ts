import { type GameEvent, type GameState } from 'src/agnostic/gameState.ts';

export type ClientError =
	| 'missing-game-id'
	| 'invalid-game-id'
	| 'missing-player-id'
	| 'invalid-player-id'
	| 'missing-pass'
	| 'invalid-pass'
	| 'incorrect-pass'
	| 'missing-name'
	| 'invalid-name'
	| 'already-playing';

export interface ClientErrorEvent {
	type: 'client-error';
	data: ClientError[];
}

export type ServerError = 'sumthing-bad-happn';

export interface ServerErrorEvent {
	type: 'server-error';
	data: ServerError[];
}

export interface SetGameStateEvent {
	type: 'set-game-state';
	data: GameState;
}

export interface BatchEvent {
	type: 'batch';
	data: GameEvent[];
}

export type ServerEvent = GameEvent | BatchEvent | SetGameStateEvent | ClientErrorEvent | ServerErrorEvent;
export type ClientEvent = GameEvent | BatchEvent;
export type MaybeBatchGameEvent = GameEvent | BatchEvent;
