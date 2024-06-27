import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/context/ClientContextProvider.tsx';
import 'src/frontend/game/game-app.css';
import { Round } from 'src/frontend/game/Round.tsx';
import { useState } from 'preact/hooks';

export enum GameMode {
	SingleTeam = 'GAME_MODE_SINGLE_TEAM',
	MultiTeam = 'GAME_MODE_MULTI_TEAM',
}

export const DevelopmentApp: FunctionalComponent = () => {
	const [gameMode, setGameMode] = useState(GameMode.SingleTeam);
	const onSingleTeamClick = () => setGameMode(GameMode.SingleTeam);
	const onMultiTeamClick = () => setGameMode(GameMode.MultiTeam);
	return (
		<ClientContextProvider>
			<button onClick={onSingleTeamClick}>Single Team</button>
			<button class="button--purple" onClick={onMultiTeamClick}>
				Multi Team
			</button>
			<Round
				teamName="team name"
				teamPreviews={
					gameMode === GameMode.MultiTeam
						? [
								{
									teamName: 'team 1',
									drawer: 'drawer 1',
									canvasPreview: 'canvas preview',
								},
								{
									teamName: 'team 2',
									drawer: 'drawer 2',
									canvasPreview: 'canvas preview',
								},
							]
						: []
				}
			/>
		</ClientContextProvider>
	);
};
