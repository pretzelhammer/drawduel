import { Maybe } from 'src/agnostic/types';

export type PlayerId = string;
export type GameId = string;
export type TeamId = string;
export type GamePhase = 'pre-game' | 'rounds' | 'post-game';

/**
 * the state of the game, synced
 * between the server and all players
 */
export interface GameState {
	id: GameId;
	phase: GamePhase;
	teams: GameTeams;
	players: GamePlayers;
}

export interface GameTeams {
	[key: TeamId]: GameTeam;
}

export interface GameTeam {
	score: number;
	players: TeamPlayers;
}

export interface TeamPlayers {
	[key: PlayerId]: TeamPlayer;
}

export interface TeamPlayer {
	role: TeamPlayerRole;
}

export type TeamPlayerRole = 'drawer' | 'guesser' | 'spectator';

export interface GamePlayers {
	[key: PlayerId]: GamePlayer;
}

export interface GamePlayer {
	id: PlayerId;
	name: string;
	score: number;
	team: TeamId;
	ready: boolean;
}

/**
 * new player is joining the game
 */
export interface JoinEvent {
	type: 'join';
	data: {
		id: PlayerId;
		name: string;
		team: TeamId;
	};
}

/**
 * player is joining or changing teams
 */
export interface JoinTeamEvent {
	type: 'join-team';
	data: {
		id: PlayerId;
		team: TeamId;
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
export interface IncPlayerScoreEvent {
	type: 'inc-player-score';
	data: {
		id: PlayerId;
		score: number;
	};
}

/**
 * change player's name
 */
export interface ChangePlayerNameEvent {
	type: 'change-player-name';
	data: {
		id: PlayerId;
		name: string;
	};
}

/**
 * changes phase of the game
 */
export interface ChangeGamePhaseEvent {
	type: 'change-game-phase';
	data: GamePhase;
}

export interface PlayerReadyEvent {
	type: 'ready';
	data: PlayerId;
}

/**
 * union type representing all possible types
 * of game events
 */
export type GameEvent =
	| JoinEvent
	| JoinTeamEvent
	| LeftEvent
	| IncPlayerScoreEvent
	| ChangePlayerNameEvent
	| ChangeGamePhaseEvent
	| PlayerReadyEvent;

export function initGameState(gameId: GameId): GameState {
	return {
		id: gameId,
		phase: 'pre-game',
		players: {},
		teams: {},
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
		// players data can only be deleted from the game if
		// they exist, have zero score, and we haven't started
		// the game yet
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		return player && player.score === 0 && gameState.phase === 'pre-game';
	} else if (gameEvent.type === 'inc-player-score') {
		// can only increase the score of players who exist
		return !!gameState.players[gameEvent.data.id];
	} else if (gameEvent.type === 'change-player-name') {
		// can only change name of player who exists
		const player = gameState.players[gameEvent.data.id];
		if (!player) {
			return false;
		}
		// and only if it isn't their name already
		return player.name !== gameEvent.data.name;
	} else if (gameEvent.type === 'change-game-phase') {
		return gameState.phase !== gameEvent.data;
	} else if (gameEvent.type === 'join-team') {
		// only if player exists and isn't already
		// on that team
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data.id];
		return player && player.team !== gameEvent.data.team;
	} else if (gameEvent.type === 'ready') {
		// player exists and isn't already ready
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		return player && !player.ready;
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
			ready: false,
		};
		const team: GameTeam = gameState.teams[gameEvent.data.team] || {
			players: {},
			score: 0,
		};
		team.players[gameEvent.data.id] = {
			role: 'guesser',
		};
		gameState.teams[gameEvent.data.team] = team;
	} else if (gameEvent.type === 'left') {
		let player: GamePlayer = gameState.players[gameEvent.data];
		// delete player from game
		delete gameState.players[gameEvent.data];
		// delete player from team
		delete gameState.teams[player.team].players[player.id];
		// if team is now empty also delete team
		if (Object.keys(gameState.teams[player.team].players).length === 0) {
			delete gameState.teams[player.team];
		}
	} else if (gameEvent.type === 'inc-player-score') {
		const player: GamePlayer = gameState.players[gameEvent.data.id];
		player.score += gameEvent.data.score;
		// also increase score of player's team
		gameState.teams[player.team].score += gameEvent.data.score;
	} else if (gameEvent.type === 'change-player-name') {
		gameState.players[gameEvent.data.id].name = gameEvent.data.name;
	} else if (gameEvent.type === 'change-game-phase') {
		gameState.phase = gameEvent.data;
	} else if (gameEvent.type === 'join-team') {
		const playerId = gameEvent.data.id;
		const newTeamId = gameEvent.data.team;
		const oldTeamId = gameState.players[playerId].team;
		const oldTeam = gameState.teams[oldTeamId];
		// delete player from old team, if exists
		if (oldTeam) {
			delete oldTeam.players[playerId];
			if (Object.keys(oldTeam.players).length === 0) {
				// if removing this player makes the team
				// empty then also delete the team
				delete gameState.teams[oldTeamId];
			}
		}
		// player joins new team
		gameState.players[playerId].team = newTeamId;
		// create new team if it doesn't already exist
		const newTeam: GameTeam = gameState.teams[newTeamId] || {
			players: {},
			score: 0,
		};
		newTeam.players[playerId] = {
			role: 'guesser',
		};
		gameState.teams[newTeamId] = newTeam;
	} else if (gameEvent.type === 'ready') {
		gameState.players[gameEvent.data].ready = true;
	}
	return gameState;
}
