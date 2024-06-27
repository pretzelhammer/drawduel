// NOTE: each word should be:
// - all lower case
// - in singular case UNLESS the word is
//   always in plural case, e.g. grapes, sheep, shorts, united states

// in general, if an emoji exists for it, then it should
// be pretty easy to draw, can source easy words from sites
// like https://emojipedia.org/

// for starters, we're thinking easy words
// should set these round properties:
// - 40 second timer to draw & guess
// - 2x score multiplier
export const easy: string[] = [
	// general animals
	'cat',
	'bat',
	'ant',
	'horse',
	'rabbit',
	'sheep',
	'monkey',

	// sports
	'soccer',
	'football',
	'baseball',
	'tennis',

	// objects
	'pencil',
	'brush',
	'notebook',

	// clothes
	'sock',
	'pants',
	'shirt',
	'shorts',
	'tuxedo',
	'suit',

	// tools
	'hammer',
	'screwdriver',
	'ruler',
	'compass',

	// kitchen objects
	'oven',
	'spoon',
	'fork',
	'knife',
	'pan',
	'pot',

	// buildings
	'house',
	'shack',
	'mansion',
	'skyscraper',

	// building objects
	'window',
	'door',
	'staircase',
	'basement',
	'attic',

	// fruit
	'grapes',
	'orange',
	'banana',
	'pineapple',
	'blueberry',
	'raspberry',
	'watermelon',
	'cherry',

	// vegetables
	'tomato',
	'potato',
	'cucumber',
	'mushroom',

	// professions
	'policeman',
	'firefighter',

	// countries
	'united states',
	'canada',
	'mexico',

	// emojis
	'heart',
	'fire',
	'skull',
];

// in general, hard words should be harder to draw
// and guess than easy words, but not impossible

// for starters, we're thinking easy words
// should set these round properties:
// - 60 second timer to draw & guess
// - 3x score multiplier
export const hard: string[] = [
	// animals
	'pelican',
	'orangutan',

	// professions
	'accountant',
];

// examples of nearly IMPOSSIBLE
// words to draw:
// - ironic
// - ephemeral
// - procrastination
