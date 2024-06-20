import { render } from 'preact';
import IndexApp from 'src/frontend/index/IndexApp.tsx';
import 'src/frontend/global.css';

render(<IndexApp />, document.getElementById('index-app')!);
