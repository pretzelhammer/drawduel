import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { countLetters } from 'src/agnostic/strings.ts';
import { MAX_ROUND_ID } from 'src/agnostic/constants';

export const WordClue: FunctionalComponent = () => {
	let { clientContext } = useClientContext();
	const myId = clientContext.clientState.player.id;
	const me = clientContext.gameState.players[myId];
	const roundId = clientContext.gameState.round;
	if (roundId < 0 || roundId > MAX_ROUND_ID) {
		return <span></span>;
	}
	const currentRound = clientContext.gameState.rounds[roundId];
	if (currentRound.phase !== 'pre-play' && currentRound.phase !== 'play' && currentRound.phase !== 'post-round') {
		return <span></span>;
	}
	let wordClue = <>{currentRound.word.content}</>;
	if (me.role === 'guesser' && currentRound.phase !== 'post-round') {
		let parts = currentRound.word.content.split(' ');
		wordClue = (
			<>
				{parts.map((part) => {
					const letterCount = countLetters(part);
					const hint = Array(letterCount).fill('_').join(' ');
					return (
						<>
							{hint}
							<sup>{letterCount}</sup>
						</>
					);
				})}
			</>
		);
	}

	return (
		<span>
			the word {currentRound.phase === 'post-round' ? 'was' : 'is'} {wordClue}
		</span>
	);
};
