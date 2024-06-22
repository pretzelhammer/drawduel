import { render } from 'preact';
import GameApp from 'src/frontend/game/GameApp.tsx';
import 'src/frontend/global.css';
import { randomShortId } from 'src/agnostic/random.ts';

// this route should always have a game short id
// in the hash, if it doesn't we randomly generate one
// and set it here
if (!(window.location.hash.length > 1)) {
	window.location.hash = randomShortId();
}

render(<GameApp />, document.getElementById('game-app')!);
