import { type FunctionalComponent } from 'preact';
import { Lobby } from 'src/frontend/game/Lobby.tsx';
import { Round } from 'src/frontend/game/Round.tsx';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { Route } from 'src/frontend/game/context/clientContext.ts';

export const Main: FunctionalComponent = () => {
	const { clientContext } = useClientContext();
	switch (clientContext.clientState.route) {
		case Route.Lobby:
			return <Lobby />;
		case Route.Round:
			return (
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
			);
		default:
			return null;
	}
};
