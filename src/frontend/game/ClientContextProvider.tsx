import { createContext, type FunctionalComponent } from 'preact';
import { useCallback, useContext, useState } from 'preact/hooks';
import { type GameEvent } from 'src/agnostic/gameState.ts';
import { type ClientState, initClientContext, type ClientContext } from 'src/frontend/game/clientContext.ts';
import { connect } from 'src/frontend/game/utils/sockets';

const initialClientContext = initClientContext();
console.log('initial client context', initialClientContext);

const socket = connect();
socket.on('message', (message: string) => {
	console.log('GOT FROM SERVER:', message);
});
console.log('SENT TO SERVER: PING');
socket.emit('message', 'PING');

type UseClientContext = [
	ClientContext,
	(gameEvent: GameEvent) => void, // dispatch game event
	(clientState: ClientState) => void, // set client state
];

const ClientContextKey = createContext<UseClientContext>([
	initialClientContext,
	(_gameEvent: GameEvent) => {},
	(_clientState: ClientState) => {},
]);

function useClientContext(): UseClientContext {
	return useContext(ClientContextKey);
}

const ClientContextProvider: FunctionalComponent = ({ children }) => {
	const [clientContext, setClientContext] = useState(initialClientContext);

	const dispatchGameEvent = useCallback(
		(_gameEvent: GameEvent) => {
			// TODO implement
			// would use setClientContext somewhere here
		},
		[clientContext, setClientContext],
	);

	const setClientState = useCallback(
		(_clientState: ClientState) => {
			// TODO implement
			// would use setClientContext somewhere here
		},
		[clientContext, setClientContext],
	);

	return (
		<ClientContextKey.Provider value={[clientContext, dispatchGameEvent, setClientState]}>
			{children}
		</ClientContextKey.Provider>
	);
};

export { ClientContextProvider, useClientContext };
