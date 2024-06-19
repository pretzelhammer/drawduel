import { render } from 'preact';
import { App } from 'src/frontend/index/App.tsx';
import 'src/frontend/global.css';

render(<App />, document.getElementById('app')!);
