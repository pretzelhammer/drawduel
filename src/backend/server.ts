import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import util from 'util';

function log(...args: any[]) {
	console.log(util.inspect(args, { depth: null }));
}

const app = express();
const port = process.env.PORT || 9001;

const cwd = process.cwd();

// Middleware to serve static files from the ./dist directory
app.use(express.static(path.join(cwd, './dist')));

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
