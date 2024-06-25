import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { useClientContext } from 'src/frontend/game/ClientContextProvider.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';

export const RoundsPhase: FunctionalComponent = () => {
	const { clientContext } = useClientContext();
	const currentRound = clientContext.gameState.round;
	const currentRoundPhase = clientContext.gameState.rounds[currentRound].phase;
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<h2>round page</h2>
			<h3>current round: {clientContext.gameState.round}</h3>
			<h3>current round phase: {currentRoundPhase}</h3>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<PrintClientContext />
		</>
	);
};
