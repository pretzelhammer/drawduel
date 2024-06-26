import { type FunctionalComponent } from 'preact';
import { PlayerList } from 'src/frontend/game/components/PlayerList.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore.tsx';
import { ChangeName } from 'src/frontend/game/components/ChangeName.tsx';
import { PrintClientContext } from 'src/frontend/game/components/PrintClientContext.tsx';
import { Ready } from 'src/frontend/game/components/Ready.tsx';
import { ReadyCount } from 'src/frontend/game/components/ReadyCount.tsx';
import { Round } from 'src/frontend/game/Round.tsx';
import { Timer } from '../components/Timer';

export const PreGamePhase: FunctionalComponent = () => {
	return (
		<>
			<h2>pre-game page</h2>
			<PlayerList />
			<IncreaseMyScore />
			<ChangeName />
			<Ready />
			<ReadyCount />
			<Timer />
			<Round
				teamName="team name"
				teamPreviews={[
					{
						teamName: 'team name',
						drawer: 'drawer',
						canvasPreview: 'canvas preview',
					},
				]}
			/>
			<PrintClientContext />
		</>
	);
};
