import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/ClientContextProvider.tsx';
import { IncreaseMyScore } from 'src/frontend/components/IncreaseMyScore';

export const PlayerList: FunctionalComponent = () => {
	const [clientContext, dispatchGameEvent, setClientState] = useClientContext();
	return (
		<>
			<div style="margin-bottom: 16px;">{JSON.stringify(clientContext)}</div>
			<IncreaseMyScore />
		</>
	);
};
