import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/ClientContextProvider.tsx';
import { PlayerList } from 'src/frontend/game/components/PlayerList';
import 'src/frontend/game/game-app.css';

export const GameApp: FunctionalComponent = () => {
	return (
		<ClientContextProvider>
			<h1>draw duel 🎨⚔️</h1>
			<h2>game page</h2>
			<PlayerList />
		</ClientContextProvider>
	);
};
