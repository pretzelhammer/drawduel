import { Maybe } from 'src/agnostic/types.ts';
import { randomEasyWord, randomHardWord, randomShortId } from 'src/agnostic/random.ts';

export type PlayerId = string;
export type GameId = string;
export type TeamId = string;

// -1 = rounds haven't started
// 1 - 14 = regular round
export type RoundId = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export type GamePhase = 'pre-game' | 'rounds' | 'lightning-round' | 'post-game';

/**
 * the state of the game, synced
 * between the server and all players
 */
export interface GameState {
	id: GameId;
	nextId: GameId;
	phase: GamePhase;
	teams: GameTeams;
	players: GamePlayers;
	// if timer = 0 it means there is no timer,
	// otherwise it should also be a unix timestamp
	// in milliseconds in the future, and is the point
	// in time that the current phase ends and the next
	// phase will begin
	timer: UnixMs;
	round: RoundId;
	rounds: Rounds;
	lightningRound: LightningRound;
}

export type Rounds = Round[];

export interface Round {
	phase: RoundPhaseType;
	drawers: PlayerId[];
	chooser: PlayerId;
	choices: WordChoices;
	word: ChosenWord;
	teams: RoundTeams;
}

export interface RoundTeams {
	[key: TeamId]: RoundTeam;
}

export interface RoundTeam {
	drawing: string[]; // TODO make array of draw events
	guesses: string[]; // TODO make array of guess events
}

export interface WordChoices {
	easy: string;
	hard: string;
}

export interface ChosenWord {
	content: string;
	difficulty: string;
}

export type RoundPhaseType = 'intro' | 'pick-word' | 'pre-play' | 'play' | 'post-round';

export type LightningRoundPhaseType = 'intro' | 'play' | 'post-round';

export interface LightningRound {
	phase: LightningRoundPhaseType;
	// TODO add more stuff here
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

export interface TeamPlayer {}

export type PlayerRole = 'drawer' | 'guesser' | 'spectator';

export interface GamePlayers {
	[key: PlayerId]: GamePlayer;
}

export interface GamePlayer {
	id: PlayerId;
	name: string;
	score: number;
	team: TeamId;
	ready: boolean;
	connected: boolean;
	role: PlayerRole;
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
	type: 'game-phase';
	data: GamePhase;
}

export interface ChangeRoundPhaseEvent {
	type: 'round-phase';
	data: RoundPhaseType;
}

/**
 * player readied
 */
export interface PlayerReadyEvent {
	type: 'ready';
	data: PlayerId;
}

/**
 * player reconnected after disconnecting
 */
export interface PlayerReconnectEvent {
	type: 'reconnect';
	data: PlayerId;
}

/**
 * player disconnected
 */
export interface PlayerDisconnectEvent {
	type: 'disconnect';
	data: PlayerId;
}

export type UnixMs = number;

/**
 * sets timer
 */
export interface TimerEvent {
	type: 'timer';
	data: UnixMs;
}

/**
 * creates a new round
 */
export interface NewRoundEvent {
	type: 'new-round';
	data: {
		drawers: PlayerId[];
		chooser: PlayerId;
		choices: WordChoices;
	};
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
	| ChangeRoundPhaseEvent
	| PlayerReconnectEvent
	| PlayerDisconnectEvent
	| TimerEvent
	| NewRoundEvent
	| PlayerReadyEvent;

export function initGameState(gameId: GameId): GameState {
	return {
		id: gameId,
		nextId: randomShortId(),
		phase: 'pre-game',
		players: {},
		teams: {},
		timer: 0,
		round: -1,
		rounds: [],
		lightningRound: {
			phase: 'intro',
		},
	};
}

export function generateRound(teamIds: TeamId[], drawers: PlayerId[], chooser: PlayerId, choices: WordChoices): Round {
	const roundTeams: RoundTeams = {};
	for (let teamId of teamIds) {
		roundTeams[teamId] = {
			drawing: [],
			guesses: [],
		};
	}
	return {
		phase: 'intro',
		drawers,
		chooser,
		choices,
		word: {
			content: choices.easy,
			difficulty: 'easy',
		},
		teams: roundTeams,
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
	} else if (gameEvent.type === 'game-phase') {
		return gameState.phase !== gameEvent.data;
	} else if (gameEvent.type === 'join-team') {
		// only if player exists and isn't already
		// on that team
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data.id];
		return player && player.team !== gameEvent.data.team;
	} else if (gameEvent.type === 'ready') {
		// player exists and isn't already ready
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		if (player && player.ready) {
			return false;
		}
		// also, can only ready during pre-game phase or rounds.post-round phase
		if (gameState.phase === 'pre-game') {
			return true;
		}
		if (gameState.phase === 'rounds') {
			let roundPhase = gameState.rounds[gameState.round].phase;
			if (roundPhase === 'post-round') {
				return true;
			}
		}
		return false;
	} else if (gameEvent.type === 'reconnect') {
		// player exists and is disconnected
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		return player && !player.connected;
	} else if (gameEvent.type === 'disconnect') {
		// player exists and is connected
		const player: Maybe<GamePlayer> = gameState.players[gameEvent.data];
		return player && player.connected;
	} else if (gameEvent.type === 'timer') {
		// timer can always be set
		return true;
	} else if (gameEvent.type === 'new-round') {
		// game has a max of 15 regular rounds
		return gameState.round < 14;
	} else if (gameEvent.type === 'round-phase') {
		if (gameState.round >= 0 && gameState.round <= 14) {
			const currentPhase = gameState.rounds[gameState.round].phase;
			return currentPhase !== gameEvent.data;
		}
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
			connected: true,
			role: 'guesser',
		};
		const team: GameTeam = gameState.teams[gameEvent.data.team] || {
			players: {},
			score: 0,
		};
		team.players[gameEvent.data.id] = {};
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
	} else if (gameEvent.type === 'game-phase') {
		// change game phase
		gameState.phase = gameEvent.data;
		// changing game phase also always resets players ready
		// flags, their roles, and resets the timer
		const players = Object.values(gameState.players);
		for (let player of players) {
			player.ready = false;
			player.role = 'guesser';
		}
		gameState.timer = 0;
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
		newTeam.players[playerId] = {};
		gameState.teams[newTeamId] = newTeam;
	} else if (gameEvent.type === 'ready') {
		gameState.players[gameEvent.data].ready = true;
	} else if (gameEvent.type === 'reconnect') {
		gameState.players[gameEvent.data].connected = true;
	} else if (gameEvent.type === 'disconnect') {
		gameState.players[gameEvent.data].connected = false;
	} else if (gameEvent.type === 'timer') {
		gameState.timer = gameEvent.data;
	} else if (gameEvent.type === 'new-round') {
		// generate & push new round
		const teamIds = Object.keys(gameState.teams);
		gameState.rounds.push(
			generateRound(teamIds, gameEvent.data.drawers, gameEvent.data.chooser, gameEvent.data.choices),
		);
		// update round id
		gameState.round += 1;
		const players = Object.values(gameState.players);
		for (let player of players) {
			// reset ready flags
			player.ready = false;
			if (gameEvent.data.drawers.includes(player.id)) {
				player.role = 'drawer';
			} else {
				// reset role back to default
				player.role = 'guesser';
			}
		}
		// reset timer
		gameState.timer = 0;
	} else if (gameEvent.type === 'round-phase') {
		// change round phase
		const currentRound = gameState.rounds[gameState.round];
		currentRound.phase = gameEvent.data;
		// reset timer
		gameState.timer = 0;
	}
	return gameState;
}

export function nextGamePhase(gamePhase: GamePhase): GamePhase {
	switch (gamePhase) {
		case 'pre-game':
			return 'rounds';
		case 'rounds':
			return 'lightning-round';
		case 'lightning-round':
			return 'post-game';
		case 'post-game':
			throw new Error(`cannot advance past post-game phase`);
	}
}

export function nextRoundPhase(roundPhase: RoundPhaseType): RoundPhaseType {
	// round phases cycle, so post-round goes back to intro
	switch (roundPhase) {
		case 'intro':
			return 'pick-word';
		case 'pick-word':
			return 'pre-play';
		case 'pre-play':
			return 'play';
		case 'play':
			return 'post-round';
		case 'post-round':
			return 'intro';
	}
}
