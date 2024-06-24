import { useState } from 'preact/hooks';
import { type FunctionalComponent } from 'preact';
import { LineInput } from 'src/frontend/components/LineInput.tsx';
import { useClientContext } from 'src/frontend/game/ClientContextProvider.tsx';
import { validName } from 'src/agnostic/validation.ts';

export const ChangeName: FunctionalComponent = () => {
	let [clientContext, dispatchGameEvent] = useClientContext();
	const myId = clientContext.clientState.player.id;
	const me = clientContext.gameState.players[myId];
	let [inputValue, setInputValue] = useState(me.name);

	// can only change name if new name valid and
	// different from current name
	const canChangeName = validName(inputValue) && me.name !== inputValue;

	const onClick = () => {
		dispatchGameEvent({
			type: 'change-player-name',
			data: {
				id: myId,
				name: inputValue,
			},
		});
	};

	return (
		<>
			<LineInput
				placeholder="new name"
				value={inputValue}
				onInput={(event) => setInputValue((event.target as HTMLInputElement).value)}
			/>
			<button style="margin-top: 16px;" disabled={!canChangeName} onClick={onClick}>
				change name
			</button>
		</>
	);
};
