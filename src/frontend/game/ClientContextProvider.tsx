import { createContext, type FunctionalComponent } from 'preact';
import { useCallback, useContext, useState, useEffect, useRef } from 'preact/hooks';
import { Socket } from 'socket.io-client';
import { type ServerEvent } from 'src/agnostic/events.ts';
import { canAdvance, advance, type GameEvent } from 'src/agnostic/gameState.ts';
import {
	type ClientState,
	initClientContext,
	type ClientContext,
	dummyClientContext,
	hasSideEffect,
	performSideEffect,
	canOptimisticallyRender,
} from 'src/frontend/game/clientContext.ts';
import { connect } from 'src/frontend/game/utils/sockets.ts';
import { Maybe } from 'src/agnostic/types.ts';
import { update } from 'lodash';

type UseClientContext = [
	ClientContext,
	(gameEvent: GameEvent) => void, // dispatch game events
	(clientState: ClientState) => void, // set client state
];

const ClientContextKey = createContext<UseClientContext>([
	dummyClientContext(),
	(_gameEvent: GameEvent) => {},
	(_clientState: ClientState) => {},
]);

function useClientContext(): UseClientContext {
	return useContext(ClientContextKey);
}

function updateClientContext(clientContext: ClientContext, gameEvent: GameEvent): ClientContext {
	if (canAdvance(clientContext.gameState, gameEvent)) {
		const nextGameState = advance(clientContext.gameState, gameEvent);
		let nextClientState = clientContext.clientState;
		if (hasSideEffect(clientContext, gameEvent)) {
			nextClientState = performSideEffect(clientContext, gameEvent);
		}
		return {
			...clientContext,
			gameState: nextGameState,
			clientState: nextClientState,
		};
	} else {
		return clientContext;
	}
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
			console.log('GOT EVENT FROM SERVER:', event);
			switch (event.type) {
				case 'client-error':
					console.error('got client errors:', event.data);
					break;
				case 'server-error':
					console.error('got server errors:', event.data);
					break;
				case 'set-game-state':
					// https://dmitripavlutin.com/react-hooks-stale-closures/
					setClientContext((currentClientContext) => ({
						...currentClientContext,
						gameState: event.data,
					}));
					break;
				default:
					// https://dmitripavlutin.com/react-hooks-stale-closures/
					setClientContext((currentClientContext) => updateClientContext(currentClientContext, event));
			}
		});
	}, []);

	const dispatchGameEvent = (gameEvent: GameEvent) => {
		if (canOptimisticallyRender(gameEvent)) {
			setClientContext((currentClientContext) => updateClientContext(currentClientContext, gameEvent));
		}
		if (socket.current) {
			console.log('dispatching game event', gameEvent);
			socket.current.emit('event', gameEvent);
		} else {
			console.error('tried to dispatch game event on null socket', gameEvent);
		}
	};

	const setClientState = (clientState: ClientState) => {
		console.log('setting client state', clientState);
		setClientContext((currentClientContext) => ({
			...currentClientContext,
			clientState,
		}));
	};

	// we know we've synced with the server when we can find our
	// client player id in the game state
	const myId = clientContext.clientState.player.id;
	const syncedWithServer = !!clientContext.gameState.players[myId];

	return (
		<ClientContextKey.Provider value={[clientContext, dispatchGameEvent, setClientState]}>
			{syncedWithServer ? children : 'loading...'}
		</ClientContextKey.Provider>
	);
};

export { ClientContextProvider, useClientContext };
