import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/ClientContextProvider.tsx';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import 'src/frontend/game/game-app.css';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';

export const GameApp: FunctionalComponent = () => {
	return (
		<ClientContextProvider>
			<h1>draw duel 🎨⚔️</h1>
			<h2>game page</h2>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
		</ClientContextProvider>
	);
};
