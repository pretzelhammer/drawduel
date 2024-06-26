import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';

export const PrintClientContext: FunctionalComponent = () => {
	let { clientContext } = useClientContext();

	return <pre style="font-family: monospace; font-size: 14px;">{JSON.stringify(clientContext, null, 2)}</pre>;
};
