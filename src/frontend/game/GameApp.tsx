import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/ClientContextProvider.tsx';
import 'src/frontend/game/game-app.css';

export const GameApp: FunctionalComponent = () => {
	return (
		<ClientContextProvider>
			<h1>draw duel 🎨⚔️</h1>
			<h2>game page</h2>
		</ClientContextProvider>
	);
};
