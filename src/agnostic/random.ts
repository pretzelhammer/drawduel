import { adjectives } from 'src/agnostic/adjectives.ts';
import { animals } from 'src/agnostic/animals.ts';
import { easy, hard } from 'src/agnostic/words.ts';
import { validName } from 'src/agnostic/validation.ts';
import { type WordChoices } from 'src/agnostic/gameState.ts';

export function pickRandomChar(string: string): string {
	return string[Math.floor(Math.random() * string.length)];
}

export function pickRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function pickRandomNum(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// intentional omissions:
// - 0 & o, can be misread for each other
// - 1 & l, same reason
// - z & 2, same reason
// - s & 5, same reason
const SHORTCODE_CHARS = 'abcdefghijkmnpqrtuvwxy346789';

// used in URLs and are visible to users
// properties:
// - 4 lowercase alphanumeric characters
// - easy to read and remember
export function randomShortId(): string {
	let result = '';
	for (let i = 0; i < 4; i++) {
		result += pickRandomChar(SHORTCODE_CHARS);
	}
	return result;
}

const LONGCODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// used in game logic and are invisible to users
// properties:
// - 8 mixed case alphanumeric characters
export function randomLongId(): string {
	let result = '';
	for (let i = 0; i < 8; i++) {
		result += pickRandomChar(LONGCODE_CHARS);
	}
	return result;
}

// properties:
// - adjective + animal + 2 digit number
export function randomPlayerName(): string {
	let tryName = pickRandomItem(adjectives) + pickRandomItem(animals) + pickRandomNum(11, 99);
	while (!validName(tryName)) {
		tryName = pickRandomItem(adjectives) + pickRandomItem(animals) + pickRandomNum(11, 99);
	}
	return tryName;
}

export function randomEasyWord(): string {
	return pickRandomItem(easy);
}

export function randomHardWord(): string {
	return pickRandomItem(hard);
}

export function randomWordChoices(): WordChoices {
	return {
		easy: randomEasyWord(),
		hard: randomHardWord(),
	};
}
