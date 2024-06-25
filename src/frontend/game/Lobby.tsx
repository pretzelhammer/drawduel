import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { useClientContext } from 'src/frontend/game/ClientContextProvider.tsx';
import { Route } from 'src/frontend/game/clientContext.ts';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';

export const Lobby: FunctionalComponent = () => {
	const { clientContext, setClientState } = useClientContext();
	const goToRound = () => {
		setClientState({
			...clientContext.clientState,
			route: Route.Round,
		});
	};
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<h2>game page</h2>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<button style="margin-bottom: 32px;" onClick={goToRound}>
				start round
			</button>
			<PrintClientContext />
		</>
	);
};
