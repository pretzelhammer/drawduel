import { type FunctionalComponent } from 'preact';
import {
	MAX_ROUNDS,
	MAX_ROUND_ID,
	HAS_LIGHTNING_ROUND,
	UNREADY_PLAYER_WAIT_SECS,
	WORD_CHOICE_WAIT_SECS,
	PRE_PLAY_WAIT_SECS,
	EASY_WORD_WAIT_SECS,
	HARD_WORD_WAIT_SECS,
} from 'src/agnostic/constants.ts';

export const PrintConstants: FunctionalComponent = () => {
	return (
		<pre style="font-family: monospace; font-size: 14px;">
			{JSON.stringify(
				{
					MAX_ROUNDS,
					MAX_ROUND_ID,
					HAS_LIGHTNING_ROUND,
					UNREADY_PLAYER_WAIT_SECS,
					WORD_CHOICE_WAIT_SECS,
					PRE_PLAY_WAIT_SECS,
					EASY_WORD_WAIT_SECS,
					HARD_WORD_WAIT_SECS,
				},
				null,
				2,
			)}
		</pre>
	);
};
