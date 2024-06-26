import { FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';

export const IncreaseMyScore: FunctionalComponent = () => {
	let { clientContext, dispatchClientEvent } = useClientContext();

	const onClick = () => {
		dispatchClientEvent({
			type: 'inc-player-score',
			data: {
				id: clientContext.clientState.player.id,
				score: 100,
			},
		});
	};

	return (
		<button class="compact" style="margin-bottom: 32px;" onClick={onClick}>
			increase my score by 100
		</button>
	);
};
