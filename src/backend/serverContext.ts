import { type GameState, type GameId, type PlayerId } from 'src/agnostic/gameState.ts';

// record of game ids to games
interface ServerContext {
	[key: GameId]: ServerGameContext;
}

interface ServerGameContext {
	// state of the game, should by in sync
	// with all clients connected to this game
	gameState: GameState;
	// state specific to the server for this
	// game instance
	serverState: ServerState;
}

interface ServerState {
	players: ServerPlayersState;
}

interface ServerPlayersState {
	[key: PlayerId]: ServerPlayerState;
}

interface ServerPlayerState {
	id: string;
	pass: string;
	initialName: string;
}
