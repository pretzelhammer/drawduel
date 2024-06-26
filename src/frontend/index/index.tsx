import { render } from 'preact';
import { IndexApp } from 'src/frontend/index/IndexApp.tsx';
import 'src/frontend/global.css';

// on prod the backend server automatically does
// this redirect, but the local vite dev server
// doesn't know about it, so we manually add it
// here so we have more prod:dev parity
if (import.meta.env.DEV) {
	if (window.location.pathname === '/game') {
		window.location.pathname = '/game/';
	}
	if (window.location.pathname === '/development') {
		window.location.pathname = '/development/';
	}
}

render(<IndexApp />, document.getElementById('index-app')!);
