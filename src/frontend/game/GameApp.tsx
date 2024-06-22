import { ClientContextProvider } from 'src/frontend/game/ClientContextProvider.tsx';
import 'src/frontend/game/game-app.css';

export default function GameApp() {
	return (
		<ClientContextProvider>
			<h1>draw duel 🎨⚔️</h1>
			<h2>game page</h2>
		</ClientContextProvider>
	);
};
