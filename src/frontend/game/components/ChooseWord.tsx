import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import classes from 'src/frontend/game/components/ChooseWord.module.css';

export const ChooseWord: FunctionalComponent = () => {
	let { clientContext, dispatchClientEvent } = useClientContext();
	const myId = clientContext.clientState.player.id;
	const me = clientContext.gameState.players[myId];
	const roundId = clientContext.gameState.round;
	const currentRound = clientContext.gameState.rounds[roundId];
	if (myId !== currentRound.chooser) {
		return <div></div>;
	}
	const choices = currentRound.choices;

	const easyClick = () => {
		dispatchClientEvent({
			type: 'choose',
			data: choices.easy,
		});
	};

	const hardClick = () => {
		dispatchClientEvent({
			type: 'choose',
			data: choices.hard,
		});
	};

	return (
		<div class={classes['word-choices']}>
			<span class={classes.label}>choose a word</span>
			<div class={classes.easy}>
				<button class="compact" onClick={easyClick}>
					{choices.easy}
				</button>
				<ul class={classes.list}>
					<li>easy</li>
					<li>40s timer</li>
					<li>2x score</li>
				</ul>
			</div>
			<div class={classes.hard}>
				<button class="compact" onClick={hardClick}>
					{choices.hard}
				</button>
				<ul class={classes.list}>
					<li>hard</li>
					<li>60s timer</li>
					<li>3x score</li>
				</ul>
			</div>
		</div>
	);
};
