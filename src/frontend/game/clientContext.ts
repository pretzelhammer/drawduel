import { type GameState, type PlayerId, initGameState } from 'src/agnostic/gameState.ts';
import { randomLongId, randomPlayerName } from 'src/agnostic/random.ts';
import { parsePlayerPersona } from 'src/frontend/game/utils/parsing.ts';
import { Maybe } from 'src/agnostic/types.ts';
import isObject from 'lodash-es/isObject';

export interface ClientContext {
	// state of the game, should stay in sync
	// with what's on the server
	gameState: GameState;
	// state specific to this client
	clientState: ClientState;
}

export interface ClientState {
	player: ClientPlayerState;
};

export interface ClientPlayerState {
	id: PlayerId;
	pass: string;
	initialName: string;
}

export interface ClientPlayerPersonas {
	[key: PlayerId]: ClientPlayerState,
}

export function initClientContext(): ClientContext {
	return {
		gameState: initGameState(),
		clientState: initClientState(),
	};
}

function initClientState(): ClientState {
	return {
		player: initPlayerState(),
	};
}

function initPlayerState(): ClientPlayerState {
	const playerPersonasString = localStorage.getItem('playerPersonas');
	let playerPersonas: ClientPlayerPersonas = {};
	if (playerPersonasString) {
		const uncheckedPlayerPersonas = JSON.parse(playerPersonasString) || {};
		// run-time sanity type-check
		if (isObject(uncheckedPlayerPersonas)) {
			// valid enough to type cast
			playerPersonas = uncheckedPlayerPersonas as ClientPlayerPersonas;
		}
	}
	let playerPersona = parsePlayerPersona();
	let playerState: Maybe<ClientPlayerState> = playerPersonas[playerPersona];
	if (!playerState) {
		playerState = generateNewPlayerState();
		if (playerPersona) {
			playerState.initialName = playerPersona;
		}
		playerPersonas[playerPersona] = playerState;
		localStorage.setItem('playerPersonas', JSON.stringify(playerPersonas));
	}
	return playerState;
}

function generateNewPlayerState(): ClientPlayerState {
	return {
		id: randomLongId(),
		pass: randomLongId(),
		initialName: randomPlayerName(),
	};
}
