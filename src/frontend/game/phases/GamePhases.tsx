import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { PreGamePhase } from 'src/frontend/game/phases/PreGamePhase.tsx';
import { RoundsPhase } from 'src/frontend/game/phases/RoundsPhase.tsx';
import { PostGamePhase } from 'src/frontend/game/phases/PostGamePhase.tsx';
import { LightningRoundPhase } from 'src/frontend/game/phases/LightningRoundPhase.tsx';

export const GamePhases: FunctionalComponent = () => {
	const { clientContext } = useClientContext();
	switch (clientContext.gameState.phase) {
		case 'pre-game':
			return <PreGamePhase />;
		case 'rounds':
			return <RoundsPhase />;
		case 'lightning-round':
			return <LightningRoundPhase />;
		case 'post-game':
			return <PostGamePhase />;
		default:
			return <div>invalid game phase {clientContext.gameState.phase}</div>;
	}
};
