import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';
import { Ready } from 'src/frontend/game/components/Ready.tsx';
import { ReadyCount } from 'src/frontend/game/components/ReadyCount.tsx';

export const PreGamePhase: FunctionalComponent = () => {
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<h2>pre-game page</h2>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<Ready />
			<ReadyCount />
			<PrintClientContext />
		</>
	);
};
