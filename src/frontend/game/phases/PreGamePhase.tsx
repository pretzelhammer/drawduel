import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';
import { Ready } from 'src/frontend/game/components/Ready.tsx';
import { ReadyCount } from 'src/frontend/game/components/ReadyCount.tsx';
import { ContextualTimer } from 'src/frontend/game/components/ContextualTimer.tsx';
import { PrintConstants } from 'src/frontend/game/components/PrintConstants.tsx';

export const PreGamePhase: FunctionalComponent = () => {
	return (
		<>
			<h2>pre-game page</h2>
			<PlayerList />
			<Ready />
			<ReadyCount />
			<ContextualTimer />
			<ChangeName />
			<IncreaseMyScore />
			<PrintClientContext />
			<PrintConstants />
		</>
	);
};
