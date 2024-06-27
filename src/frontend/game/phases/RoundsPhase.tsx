import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';
import { ContextualTimer } from 'src/frontend/game/components/ContextualTimer';

export const RoundsPhase: FunctionalComponent = () => {
	const { clientContext } = useClientContext();
	const currentRound = clientContext.gameState.round;
	const currentRoundPhase = clientContext.gameState.rounds[currentRound].phase;
	return (
		<>
			<h2>round page</h2>
			<h3>round {clientContext.gameState.round + 1}</h3>
			<h3>round phase {currentRoundPhase}</h3>
			<h3>
				<ContextualTimer />
			</h3>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<PrintClientContext />
		</>
	);
};
