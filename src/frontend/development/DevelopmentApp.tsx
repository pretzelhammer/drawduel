import { type FunctionalComponent } from 'preact';
import { ClientContextProvider } from 'src/frontend/game/context/ClientContextProvider.tsx';
import 'src/frontend/game/game-app.css';
import { Round } from 'src/frontend/game/Round.tsx';

export const DevelopmentApp: FunctionalComponent = () => {
	return (
		<ClientContextProvider>
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
		</ClientContextProvider>
	);
};
