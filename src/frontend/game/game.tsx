import { render } from 'preact';
import GameApp from 'src/frontend/game/GameApp.tsx';
import 'src/frontend/global.css';

render(<GameApp />, document.getElementById('game-app')!);


