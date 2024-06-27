import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';
import { PrintConstants } from 'src/frontend/game/components/PrintConstants.tsx';

export const PostGamePhase: FunctionalComponent = () => {
	return (
		<>
			<h2>post-game page</h2>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<PrintClientContext />
			<PrintConstants />
		</>
	);
};
