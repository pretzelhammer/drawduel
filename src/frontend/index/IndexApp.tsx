import { useState } from 'preact/hooks';
import { randomShortId } from 'src/agnostic/random.ts';
import 'src/frontend/index/index-app.css';
import classes from 'src/frontend/index/IndexApp.module.css';
import { LineInput } from 'src/frontend/components/LineInput.tsx';
import { type FunctionalComponent } from 'preact';

export const IndexApp: FunctionalComponent = () => {
	const newGameId = randomShortId();
	const newGameLink = `/game/#${newGameId}`;
	const [joinGameId, setJoinGameId] = useState('');
	const joinGameLink = `/game/#${joinGameId}`;
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<h2>home page</h2>
			<div class={classes['button-group']}>
				<a class="button" href={newGameLink}>
					new game
				</a>
				<div class={classes['join-game']}>
					<LineInput
						placeholder="enter 4-character code"
						value={joinGameId}
						onInput={(event) => setJoinGameId((event.target as HTMLInputElement).value)}
					/>
					<a class="button" href={joinGameLink}>
						join game
					</a>
				</div>
			</div>
		</>
	);
};
