export function randomShortCode(): string {
	return Math.random().toString(32).slice(2, 6);
}
