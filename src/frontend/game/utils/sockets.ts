import { type Socket, io } from 'socket.io-client';

export function connect(): Socket {
	// prod uses ssl and same domain for ws connections
	let protocol = 'wss';
	let host = window.location.host;
	let query = '?doesThisGetSent=toTheServer'; // IT DOES! woohoo!

	// dev doesn't have ssl and ws server is on different domain
	if (import.meta.env.DEV) {
		protocol = 'ws';
		host = 'localhost:9999';
	}

	const wsUrl = `${protocol}://${host}${query}`;
	return io(wsUrl);
}
