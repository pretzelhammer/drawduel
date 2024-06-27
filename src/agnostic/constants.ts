/**
 * Default consts for production
 */

import { type Second } from 'src/agnostic/time.ts';

// number of rounds to play
// during the rounds phase of the game
let MAX_ROUNDS: number = 15;

// true if the game should have a lighnting
// round, false otherwise
let HAS_LIGHTNING_ROUND: boolean = false; // not implemented

// how long, in seconds, to wait for each unready
// player during the pre-game phase or the post-round
// phase after the 1st player had readied
let UNREADY_PLAYER_WAIT_SECS: Second = 10;

// how long, in seconds, to wait for the round's
// chooser to choose a word to draw
let WORD_CHOICE_WAIT_SECS: Second = 20;

// how long, in seconds, between the chooser choosing
// a word and play actually starting do we wait?
// there's a wait period because we want everyone
// to get ready at the same time
let PRE_PLAY_WAIT_SECS: Second = 5;

// how long, in seconds, should a round last if the
// chooser selected the easy word?
let EASY_WORD_WAIT_SECS: Second = 40;

// how long, in seconds, should a round last if the
// chooser selected the hard word?
let HARD_WORD_WAIT_SECS: Second = 60;

if (process.env.NODE_ENV === 'development') {
	// we may want to extend or shorten some of these
	// variables while working on different aspects
	// of the game in dev
	MAX_ROUNDS = 2;
	HAS_LIGHTNING_ROUND = false; // not implemented
	UNREADY_PLAYER_WAIT_SECS = 1;
	WORD_CHOICE_WAIT_SECS = 20;
	PRE_PLAY_WAIT_SECS = 5;
	EASY_WORD_WAIT_SECS = 40;
	HARD_WORD_WAIT_SECS = 60;
}

// the round ids are zero-indexed
const MAX_ROUND_ID = MAX_ROUNDS - 1;

export {
	MAX_ROUNDS,
	MAX_ROUND_ID,
	HAS_LIGHTNING_ROUND,
	UNREADY_PLAYER_WAIT_SECS,
	WORD_CHOICE_WAIT_SECS,
	PRE_PLAY_WAIT_SECS,
	EASY_WORD_WAIT_SECS,
	HARD_WORD_WAIT_SECS,
};
