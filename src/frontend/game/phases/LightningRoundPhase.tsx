import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';

export const LightningRoundPhase: FunctionalComponent = () => {
	const { clientContext, setClientState } = useClientContext();
	return (
		<>
			<h2>lightning round page</h2>
			<h3>lightning round phase: {clientContext.gameState.lightningRound.phase}</h3>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<PrintClientContext />
		</>
	);
};
