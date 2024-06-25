import { useState } from 'preact/hooks';
import { type FunctionalComponent } from 'preact';
import { LineInput } from 'src/frontend/components/LineInput.tsx';
import { useClientContext } from 'src/frontend/game/ClientContextProvider.tsx';
import { validName } from 'src/agnostic/validation.ts';
import { randomPlayerName } from 'src/agnostic/random';

export const ChangeName: FunctionalComponent = () => {
	let { clientContext, dispatchClientEvent } = useClientContext();
	const myId = clientContext.clientState.player.id;
	const me = clientContext.gameState.players[myId];
	let [inputValue, setInputValue] = useState('');

	// can only change name if new name valid and
	// different from current name
	const canChangeName = validName(inputValue) && me.name !== inputValue;

	const changeName = () => {
		// dispatchClientEvent({
		// 	type: 'change-player-name',
		// 	data: {
		// 		id: myId,
		// 		name: inputValue,
		// 	},
		// });
		dispatchClientEvent({
			type: 'batch',
			data: [
				{
					type: 'change-player-name',
					data: {
						id: myId,
						name: inputValue,
					},
				},
				{
					type: 'inc-player-score',
					data: {
						id: myId,
						score: 100,
					},
				},
			],
		});
		setInputValue('');
	};

	const randomizeName = () => {
		setInputValue(randomPlayerName());
	};

	return (
		<>
			<LineInput
				placeholder={me.name}
				value={inputValue}
				onInput={(event) => setInputValue((event.target as HTMLInputElement).value)}
			/>
			<div style="margin: 16px 0 32px 0;">
				<button class="compact" style="margin-right: 16px;" disabled={!canChangeName} onClick={changeName}>
					change name & +score
				</button>
				<button class="compact" onClick={randomizeName}>
					🎲
				</button>
			</div>
		</>
	);
};
