import { type GameState, type PlayerId, initGameState, GameEvent } from 'src/agnostic/gameState.ts';
import { randomLongId, randomPlayerName } from 'src/agnostic/random.ts';
import { parseGameId, parsePlayerPersona } from 'src/frontend/game/utils/parsing.ts';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';

export interface ClientContext {
	// state of the game, should stay in sync
	// with what's on the server
	gameState: GameState;
	// state specific to this client
	clientState: ClientState;
}

export interface ClientState {
	player: ClientPlayerState;
}

export interface ClientPlayerState {
	id: PlayerId;
	pass: string;
	name: string;
}

export interface ClientPlayerPersonas {
	[key: PlayerId]: ClientPlayerState;
}

export function dummyClientContext(): ClientContext {
	return {
		gameState: initGameState('dummygame'),
		clientState: dummyClientState(),
	};
}

export function dummyClientState(): ClientState {
	return {
		player: dummyPlayerState(),
	};
}

export function dummyPlayerState(): ClientPlayerState {
	return {
		id: 'dummyplayer',
		pass: 'dummypass',
		name: 'dummyname',
	};
}

export function initClientContext(): ClientContext {
	const gameId = parseGameId();
	return {
		gameState: initGameState(gameId),
		clientState: initClientState(),
	};
}

function initClientState(): ClientState {
	return {
		player: initPlayerState(),
	};
}

/**
 * game events only change game state, but sometimes
 * we might want to update something in client state
 * or in local storage as a result of a particular
 * game event, and we refer to this as a "side effect"
 *
 * this function receives the clientContext AFTER
 * the game event has already been applied to it
 */
export function hasSideEffect(clientContext: ClientContext, gameEvent: GameEvent): boolean {
	if (gameEvent.type === 'change-player-name') {
		const myId = clientContext.clientState.player.id;
		return myId === gameEvent.data.id;
	}
	return false;
}

/**
 * performs side effect, i.e. may modify client state and/or
 * localStorage using given game event
 *
 * this function receives the clientContext AFTER
 * the game event has already been applied to it
 */
export function performSideEffect(clientContext: ClientContext, gameEvent: GameEvent): ClientState {
	if (gameEvent.type !== 'change-player-name') {
		return clientContext.clientState;
	}
	clientContext.clientState.player.name = gameEvent.data.name;
	const personas = fetchPersonas();
	let persona = parsePlayerPersona();
	let playerState = personas[persona];
	if (!validPlayerState(playerState)) {
		playerState = generateNewPlayerState();
	}
	playerState.name = gameEvent.data.name;
	personas[persona] = playerState;
	savePersonas(personas);
	return clientContext.clientState;
}

function fetchPersonas(): ClientPlayerPersonas {
	const personasString = localStorage.getItem('personas');
	let personas: ClientPlayerPersonas = {};
	if (personasString) {
		const uncheckedPersonas = JSON.parse(personasString) || {};
		// run-time sanity type-check
		if (isObject(uncheckedPersonas)) {
			// valid enough to type cast
			personas = uncheckedPersonas as ClientPlayerPersonas;
		}
	}
	return personas;
}

function savePersonas(personas: ClientPlayerPersonas) {
	localStorage.setItem('personas', JSON.stringify(personas));
}

function initPlayerState(): ClientPlayerState {
	const personas = fetchPersonas();
	let persona = parsePlayerPersona();
	let playerState = personas[persona];
	if (!validPlayerState(playerState)) {
		playerState = generateNewPlayerState();
		personas[persona] = playerState;
		savePersonas(personas);
	}
	return playerState;
}

function validPlayerState(any: any): any is ClientPlayerState {
	if (!any) {
		return false;
	}
	if (!isObject(any)) {
		return false;
	}
	any = any as Partial<ClientPlayerState>;
	if (!isString(any.id)) {
		return false;
	}
	if (!isString(any.pass)) {
		return false;
	}
	if (!isString(any.name)) {
		return false;
	}
	return true;
}

function generateNewPlayerState(): ClientPlayerState {
	return {
		id: randomLongId(),
		pass: randomLongId(),
		name: randomPlayerName(),
	};
}
