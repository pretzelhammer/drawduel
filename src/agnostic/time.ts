import { UnixMs } from './gameState';

export type Second = number;
export type Ms = number;

export function now(): UnixMs {
	return Date.now();
}

export function secondsFromNow(seconds: Second): UnixMs {
	return now() + secondsToMs(seconds);
}

export function msToSeconds(ms: Ms): Second {
	return ms / 1_000;
}

export function msUntil(future: UnixMs): Ms {
	return future - now();
}

export function secondsUntil(future: UnixMs): Second {
	return msToSeconds(msUntil(future));
}

export function secondsToMs(seconds: Second): Ms {
	return seconds * 1_000;
}
