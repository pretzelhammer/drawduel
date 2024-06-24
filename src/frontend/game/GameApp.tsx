import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/ClientContextProvider.tsx';
import 'src/frontend/game/game-app.css';
import { Main } from 'src/frontend/game/Main.tsx';

export const GameApp: FunctionalComponent = () => {
	return (
		<ClientContextProvider>
			<Main />
		</ClientContextProvider>
	);
};
