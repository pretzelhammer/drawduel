import path from 'path';
import util from 'util';
import express from 'express';
import http from 'http';
import { WebSocketServer, RawData } from 'ws';
import { Buffer } from 'buffer';

function _log(...args: any[]) {
	console.log(util.inspect(args, { depth: null }));
}

function rawDataToString(rawData: RawData): string {
	let buffer: Buffer;
	if (Array.isArray(rawData)) {
		// If it's an array of Buffers, concatenate them into a single Buffer
		buffer = Buffer.concat(rawData);
	} else if (rawData instanceof ArrayBuffer) {
		// If it's an ArrayBuffer, convert it to a Buffer
		buffer = Buffer.from(rawData);
	} else {
		// Otherwise, assume it's already a Buffer
		buffer = rawData;
	}
	// Convert the Buffer to a string
	return buffer.toString('utf-8');
}

const cwd = process.cwd();

// Create an Express app
const app = express();

// Middleware to serve static files from the ./dist directory
app.use(express.static(path.join(cwd, './dist')));

const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', function connection(ws, _request) {
	console.log('client connected');

	ws.on('error', console.error);

	ws.on('message', function incoming(rawData: RawData, _isBinary) {
		const message = rawDataToString(rawData);
		if (message === 'PING') {
			ws.send('PONG');
		}
	});

	ws.send('Hello from server!');
});

let port = 80;
if (process.env.NODE_ENV === 'development') {
	port = 9999;
}

server.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
