import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';

export const ReadyCount: FunctionalComponent = () => {
	let { clientContext } = useClientContext();
	const players = Object.values(clientContext.gameState.players);
	const playerCount = players.length;
	let readyCount = 0;
	for (let player of players) {
		if (player.ready) {
			readyCount += 1;
		}
	}

	return (
		<span>
			{readyCount}/{playerCount} players ready
		</span>
	);
};
