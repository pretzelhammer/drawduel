import { type Server as HttpServer } from 'http';
// import { WebSocketServer, type RawData } from 'ws';
// import { Buffer } from 'buffer';

// function rawDataToString(rawData: RawData): string {
// 	let buffer: Buffer;
// 	if (Array.isArray(rawData)) {
// 		// If it's an array of Buffers, concatenate them into a single Buffer
// 		buffer = Buffer.concat(rawData);
// 	} else if (rawData instanceof ArrayBuffer) {
// 		// If it's an ArrayBuffer, convert it to a Buffer
// 		buffer = Buffer.from(rawData);
// 	} else {
// 		// Otherwise, assume it's already a Buffer
// 		buffer = rawData;
// 	}
// 	// Convert the Buffer to a string
// 	return buffer.toString('utf-8');
// }

// export function setupWsServer(server: Server) {
// 	const wss = new WebSocketServer({ server });
// 	wss.on('connection', function connection(ws, _request) {
// 		console.log('client connected');

// 		ws.on('error', console.error);

// 		ws.on('message', function incoming(rawData: RawData, _isBinary) {
// 			const message = rawDataToString(rawData);
// 			if (message === 'PING') {
// 				ws.send('PONG');
// 			}
// 		});

// 		ws.send('Hello from server!');
// 	});
// };

import { Server as WsServer, type ServerOptions } from 'socket.io';
import { log } from 'src/backend/log.ts';

const wsOptions: Partial<ServerOptions> = {};

if (process.env.NODE_ENV === 'development') {
	wsOptions.cors = {
		origin: ['http://localhost:8888'],
	};
}

export function setupWsServer(httpServer: HttpServer) {
	const wsServer = new WsServer(httpServer, wsOptions);

	wsServer.on('connection', (socket) => {
		log('client connected', socket.handshake);

		socket.emit('message', 'Hello from server!');

		socket.on('message', (message) => {
			if (message === 'PING') {
				socket.emit('message', 'PONG');
			}
		});
	});
}
