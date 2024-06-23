// game hashes have this format:
// #{gameId}-{playerPersona}

function trimHash(str: string): string {
	if (str.startsWith('#')) {
		return str.slice(1);
	}
	return str;
}

export function parseGameId(): string {
	let hashString = trimHash(window.location.hash);
	let hashStringParts = hashString.split('-');
	if (hashStringParts.length >= 1 && hashStringParts[0].length >= 1) {
		return hashStringParts[0];
	}
	// if we expect there to be a game id but there isn't
	// that's an error and we should fail loudly
	throw new Error(`Cannot parse game id out of: ${hashString}`);
}

export function parsePlayerPersona(): string {
	let hashString = trimHash(window.location.hash);
	let hashStringParts = hashString.split('-');
	if (hashStringParts.length >= 2 && hashStringParts[1].length >= 1) {
		return hashStringParts[1];
	}
	// player personas are an optional feature meant for local dev
	// if it's missing it's okay, just return '' (empty string)
	return '';
}
