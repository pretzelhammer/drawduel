import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { Timer } from 'src/frontend/game/components/Timer.tsx';
import { type PlayerRole } from 'src/agnostic/gameState.ts';
import { HAS_LIGHTNING_ROUND, MAX_ROUND_ID } from 'src/agnostic/constants';

function roleToVerb(role: PlayerRole): string {
	if (role === 'drawer') {
		return 'draw';
	} else if (role === 'guesser') {
		return 'guess';
	} else if (role === 'spectator') {
		return 'spectate';
	}
	return '???';
}

export const ContextualTimer: FunctionalComponent = () => {
	let { clientContext } = useClientContext();
	let message = '';
	let gamePhase = clientContext.gameState.phase;
	let me = clientContext.gameState.players[clientContext.clientState.player.id];
	if (gamePhase === 'pre-game') {
		message = 'game starts in';
	} else if (gamePhase === 'rounds') {
		let roundId = clientContext.gameState.round;
		let currentRound = clientContext.gameState.rounds[roundId];
		if (currentRound.phase === 'choose-word') {
			let chooserPlayer = clientContext.gameState.players[currentRound.chooser];
			message = `${chooserPlayer.name} is choosing a word in`;
		} else if (currentRound.phase === 'pre-play') {
			message = `get ready to ${roleToVerb(me.role)} in`;
		} else if (currentRound.phase === 'play') {
			message = `${roleToVerb(me.role)} the word in`;
		} else if (currentRound.phase === 'post-round') {
			if (roundId < MAX_ROUND_ID) {
				message = 'next round starts in';
			} else if (HAS_LIGHTNING_ROUND) {
				message = 'lightning round starts in';
			}
		}
	} else if (gamePhase === 'post-game') {
		message = 'next game starts in';
	}

	return <Timer message={message} />;
};
