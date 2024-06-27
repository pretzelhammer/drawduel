import { type GameId, type PlayerId } from 'src/agnostic/gameState.ts';

const MIN_NAME_LENGTH = 2;
const MIN_GAME_ID_LENGTH = 4;
const MIN_PLAYER_ID_LENGTH = 8;
const MIN_PASS_LENGTH = 8;
const MAX_LENGTH = 16;

const idRegex = /^[a-zA-Z0-9]+$/;
const nameRegex = /^[a-zA-Z0-9-_ ]+$/;

export function validGameId(gameId: GameId): boolean {
	if (gameId.length < MIN_GAME_ID_LENGTH) {
		return false;
	}
	if (gameId.length > MAX_LENGTH) {
		return false;
	}
	return idRegex.test(gameId);
}

export function validPlayerId(playerId: PlayerId): boolean {
	if (playerId.length < MIN_PLAYER_ID_LENGTH) {
		return false;
	}
	if (playerId.length > MAX_LENGTH) {
		return false;
	}
	return idRegex.test(playerId);
}

export function validPass(pass: string): boolean {
	if (pass.length < MIN_PASS_LENGTH) {
		return false;
	}
	if (pass.length > MAX_LENGTH) {
		return false;
	}
	return idRegex.test(pass);
}

export function validName(name: string): boolean {
	if (name.length < MIN_NAME_LENGTH) {
		return false;
	}
	if (name.length > MAX_LENGTH) {
		return false;
	}
	return nameRegex.test(name);
}
