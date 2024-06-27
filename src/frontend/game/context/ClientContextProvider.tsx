import { createContext, type FunctionalComponent } from 'preact';
import { useContext, useState, useEffect, useRef } from 'preact/hooks';
import { Socket } from 'socket.io-client';
import { type ClientEvent, type MaybeBatchGameEvent, type ServerEvent } from 'src/agnostic/events.ts';
import { canAdvance, advance, type GameEvent } from 'src/agnostic/gameState.ts';
import {
	type ClientState,
	initClientContext,
	type ClientContext,
	dummyClientContext,
	hasSideEffect,
	performSideEffect,
	canOptimisticallyRender,
} from 'src/frontend/game/context/clientContext.ts';
import { connect } from 'src/frontend/game/utils/sockets.ts';
import { Maybe } from 'src/agnostic/types.ts';

export interface UseClientContext {
	clientContext: ClientContext;
	dispatchClientEvent: (clientEvent: ClientEvent) => void;
	setClientState: (clientState: ClientState) => void;
}

// use dummy values for default
const ClientContextKey = createContext<UseClientContext>({
	clientContext: dummyClientContext(),
	dispatchClientEvent: (_clientEvent: ClientEvent) => {},
	setClientState: (_clientState: ClientState) => {},
});

function useClientContext(): UseClientContext {
	return useContext(ClientContextKey);
}

function updateClientContext(clientContext: ClientContext, event: MaybeBatchGameEvent): ClientContext {
	let gameEvents: GameEvent[] = [];
	if (event.type === 'batch') {
		gameEvents = event.data;
	} else {
		gameEvents.push(event);
	}
	for (let gameEvent of gameEvents) {
		if (canAdvance(clientContext.gameState, gameEvent)) {
			clientContext.gameState = advance(clientContext.gameState, gameEvent);
			if (hasSideEffect(clientContext, gameEvent)) {
				clientContext.clientState = performSideEffect(clientContext, gameEvent);
			}
		}
	}
	return { ...clientContext };
}

const ClientContextProvider: FunctionalComponent = ({ children }) => {
	const [clientContext, setClientContext] = useState(initClientContext());
	let socket = useRef<Maybe<Socket>>(null);

	useEffect(() => {
		socket.current = connect(
			clientContext.gameState.id,
			clientContext.clientState.player.id,
			clientContext.clientState.player.pass,
			clientContext.clientState.player.name,
		);
		socket.current.on('event', (event: ServerEvent) => {
			console.log('got event from server', event);
			switch (event.type) {
				case 'client-error':
					console.error('got client errors', event.data);
					setClientContext((currentClientContext) => {
						const clientState = currentClientContext.clientState;
						clientState.clientErrors = event.data;
						return {
							...currentClientContext,
							clientState,
						};
					});
					break;
				case 'server-error':
					console.error('got server errors', event.data);
					setClientContext((currentClientContext) => {
						const clientState = currentClientContext.clientState;
						clientState.serverErrors = event.data;
						return {
							...currentClientContext,
							clientState,
						};
					});
					break;
				case 'set-game-state':
					// https://dmitripavlutin.com/react-hooks-stale-closures/
					setClientContext((currentClientContext) => ({
						...currentClientContext,
						gameState: event.data,
					}));
					break;
				default:
					setClientContext((currentClientContext) => updateClientContext(currentClientContext, event));
			}
		});
	}, []);

	const dispatchClientEvent = (event: ClientEvent) => {
		if (canOptimisticallyRender(event)) {
			setClientContext((currentClientContext) => updateClientContext(currentClientContext, event));
		}
		if (socket.current) {
			console.log('dispatching game event', event);
			socket.current.emit('event', event);
		} else {
			console.error('tried to dispatch game event on null socket', event);
		}
	};

	const setClientState = (clientState: ClientState) => {
		console.log('setting client state', clientState);
		setClientContext((currentClientContext) => ({
			...currentClientContext,
			clientState,
		}));
	};

	let content = children;

	// we know we've synced with the server when we can find
	// find our client player id in the game state
	const myId = clientContext.clientState.player.id;
	const syncedWithServer = !!clientContext.gameState.players[myId];
	if (!syncedWithServer) {
		content = <span>loading...</span>;
	}

	// render a specific client error, if we get it
	const alreadyPlaying = clientContext.clientState.clientErrors.includes('already-playing');
	if (alreadyPlaying) {
		content = <span>you are already playing this game in another browser window</span>;
	}

	return (
		<ClientContextKey.Provider value={{ clientContext, dispatchClientEvent, setClientState }}>
			{content}
		</ClientContextKey.Provider>
	);
};

export { ClientContextProvider, useClientContext };
