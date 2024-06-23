import { FunctionalComponent } from 'preact';
import { useClientContext } from '../game/ClientContextProvider';

export const IncreaseMyScore: FunctionalComponent = () => {
	let [clientContext, dispatchGameEvent] = useClientContext();

	const onClick = () => {
		dispatchGameEvent({
			type: 'inc-player-score',
			data: {
				id: clientContext.clientState.player.id,
				score: 100,
			},
		});
	};

	return <button onClick={onClick}>increase my score by 100</button>;
};
