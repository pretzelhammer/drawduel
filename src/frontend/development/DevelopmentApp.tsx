import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/context/ClientContextProvider.tsx';
import 'src/frontend/development/development-app.css';
import { Round } from 'src/frontend/game/Round.tsx';
import { useState } from 'preact/hooks';
import { Brush, DrawData } from 'src/frontend/components/Canvas.tsx';
import { Color, Size } from 'src/frontend/components/DrawStage.tsx';
import { StatefulCanvas } from './components/StatefulCanvas';
import { NoReRenderCanvas } from './components/NoReRenderCanvas';
import { ThirdCanvas } from './components/ThirdCanvas';
import { FourthCanvas } from './components/FourthCanvas';

export enum GameMode {
	SingleTeam = 'GAME_MODE_SINGLE_TEAM',
	MultiTeam = 'GAME_MODE_MULTI_TEAM',
}

export const DevelopmentApp: FunctionalComponent = () => {
	const [gameMode, setGameMode] = useState(GameMode.SingleTeam);
	const onSingleTeamClick = () => setGameMode(GameMode.SingleTeam);
	const onMultiTeamClick = () => setGameMode(GameMode.MultiTeam);

	const [preview, setPreview] = useState<DrawData>({
		brushSettings: {
			brush: Brush.Pencil,
			color: Color.Black,
			size: Size.Small,
		},
		canvasDimensions: {
			width: 600,
			height: 400,
		},
		start: {
			x: 0,
			y: 0,
		},
		end: {
			x: 0,
			y: 0,
		},
	});
	return (
		<ClientContextProvider>
			<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
				<div style={{ width: '50%' }}>
					<FourthCanvas lineType={'smooth'} mode={'draw'} />
				</div>
				<div style={{ width: '25%' }}>
					<FourthCanvas lineType={'pixelated'} mode={'view'} />
					<FourthCanvas lineType={'antialiased-pixelated'} mode={'view'} />
				</div>
			</div>
			{/* <NoReRenderCanvas /> */}
			{/* <StatefulCanvas /> */}

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
									canvasPreview: preview,
								},
							]
						: []
				}
				onDraw={setPreview}
			/>
		</ClientContextProvider>
	);
};
