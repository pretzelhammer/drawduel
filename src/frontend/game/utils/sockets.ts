import { type Socket, io } from 'socket.io-client';
import { GameId, PlayerId } from 'src/agnostic/gameState';

export function connect(gameId: GameId, playerId: PlayerId, pass: string, name: string): Socket {
	// prod uses ssl and same domain for ws connections
	let protocol = 'wss';
	let host = window.location.host;
	let query =
		`?gameId=${encodeURIComponent(gameId)}` +
		`&playerId=${encodeURIComponent(playerId)}` +
		`&pass=${encodeURIComponent(pass)}` +
		`&name=${encodeURIComponent(name)}`;

	// dev doesn't have ssl and ws server is on different domain
	if (import.meta.env.DEV) {
		protocol = 'ws';
		host = 'localhost:9999';
	}

	const wsUrl = `${protocol}://${host}${query}`;
	console.log('wsUrl:', wsUrl);
	return io(wsUrl);
}
