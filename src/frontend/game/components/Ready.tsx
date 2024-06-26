import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';

export const Ready: FunctionalComponent = () => {
	let { clientContext, dispatchClientEvent } = useClientContext();
	const myId = clientContext.clientState.player.id;
	const me = clientContext.gameState.players[myId];

	// can ready only if not already ready
	const canReady = !me.ready;

	const ready = () => {
		dispatchClientEvent({
			type: 'ready',
			data: myId,
		});
	};

	return (
		<>
			<button class="compact" style="margin-bottom: 16px;" disabled={!canReady} onClick={ready}>
				I'm ready!
			</button>
		</>
	);
};
