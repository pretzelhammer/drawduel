import { render } from 'preact';
import { DevelopmentApp } from 'src/frontend/development/DevelopmentApp.tsx';
import 'src/frontend/development/development-app.css';
import 'src/frontend/global.css';
import { randomShortId } from 'src/agnostic/random.ts';

// this route should always have a game short id
// in the hash, if it doesn't we randomly generate one
// and set it here
if (!(window.location.hash.length > 1)) {
	window.location.hash = randomShortId();
}

render(<DevelopmentApp />, document.getElementById('development-app')!);
