import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/context/ClientContextProvider.tsx';
import 'src/frontend/game/game-app.css';
import { GamePhases } from 'src/frontend/game/phases/GamePhases.tsx';

export const GameApp: FunctionalComponent = () => {
	return (
		<ClientContextProvider>
			<GamePhases />
		</ClientContextProvider>
	);
};
