function randomlyPickCharacter(string: string): string {
	return string[Math.floor(Math.random() * string.length)];
}

// intentional omissions:
// - "o", gets confused with 0
const SHORTCODE_VOWELS = 'aeiu';

// intentional omissions:
// - "l", gets confused with 1
// - "z", gets confused with 2
// - "s", gets confused with 5
const SHORTCODE_CONSONANTS = 'bcdfghjkmnpqrstvwxy'

// intentional omissions:
// - 0, 1, 2, 5 for reasons stated above
const SHORTCODE_NUMBERS = '346789';

// used in URLs and are visible to users
// properties:
// - 4 characters long
// - lower case
// - pronouncible pattern: CONSONANT+VOWEL+CONSONANT+NUMBER
// - easy to read
export function randomShortId(): string {
	return randomlyPickCharacter(SHORTCODE_CONSONANTS)
		+ randomlyPickCharacter(SHORTCODE_VOWELS)
		+ randomlyPickCharacter(SHORTCODE_CONSONANTS)
		+ randomlyPickCharacter(SHORTCODE_NUMBERS);
}

const LONGCODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// used in game logic and are invisible to users
// properties:
// - 8 characters
// - mixed case
export function randomLongId(): string {
	let result = '';
	for (let i = 0; i < 8; i++) {
		result += randomlyPickCharacter(LONGCODE_CHARS);
	}
	return result;
}
