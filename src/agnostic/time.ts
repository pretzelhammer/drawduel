import { UnixMs } from './gameState';

export type Second = number;
export type Ms = number;

export function now(): UnixMs {
	return Date.now();
}

export function secondsFromNow(seconds: Second): UnixMs {
	return now() + secondsToMs(seconds);
}

export function secondsUntil(future: UnixMs): Second {
	return secondsToMs(future - now());
}

export function secondsToMs(seconds: Second): Ms {
	return seconds * 1_000;
}
