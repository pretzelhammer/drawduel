import { GameEvent, GameState } from 'src/agnostic/gameState.ts';

export type ClientError =
	| 'missing-game-id'
	| 'invalid-game-id'
	| 'missing-player-id'
	| 'invalid-player-id'
	| 'missing-pass'
	| 'invalid-pass'
	| 'incorrect-pass'
	| 'missing-name'
	| 'invalid-name';

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

export type ServerEvent = GameEvent | SetGameStateEvent | ClientErrorEvent | ServerErrorEvent;
