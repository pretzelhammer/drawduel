import path from 'path';
import express from 'express';
import http from 'http';
import { setupWsServer } from 'src/backend/wsServer';

const cwd = process.cwd();
const app = express();
app.use(express.static(path.join(cwd, './dist')));
const server = http.createServer(app);
setupWsServer(server);

let port = 80;
if (process.env.NODE_ENV === 'development') {
	port = 9999;
}

server.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
