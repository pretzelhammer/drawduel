import { type FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { secondsUntil } from 'src/agnostic/time';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';

export interface TimerProps {
	message?: string;
}

export const Timer: FunctionalComponent<TimerProps> = ({ message }) => {
	let { clientContext } = useClientContext();
	const endsAt = clientContext.gameState.timer;
	// 0 means no timer is active
	if (endsAt === 0) {
		return <span>waiting for players to ready...</span>;
	}

	const [secondsLeft, setSecondsLeft] = useState(secondsUntil(endsAt));
	useEffect(() => {
		const timer = setInterval(() => {
			const timeRemaining = secondsUntil(endsAt);
			if (timeRemaining <= 0) {
				clearInterval(timer);
				setSecondsLeft(0);
			} else {
				setSecondsLeft(timeRemaining);
			}
		}, 200);

		return () => clearInterval(timer);
	}, [clientContext.gameState.timer]);

	const rounded = Math.round(secondsLeft);
	const notBelowZero = rounded < 0 ? 0 : rounded;
	const toDisplay = notBelowZero.toString().padStart(2, '0');
	return (
		<span>
			{message} 0:{toDisplay}
		</span>
	);
};
