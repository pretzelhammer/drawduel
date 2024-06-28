import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';
import { PrintConstants } from 'src/frontend/game/components/PrintConstants.tsx';

export const PostGamePhase: FunctionalComponent = () => {
	return (
		<>
			<h2>post-game page</h2>
			<PlayerList />
			<PrintClientContext />
			<PrintConstants />
		</>
	);
};
