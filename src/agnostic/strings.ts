// string.length returns the number of bytes in
// the string, which coincidentally for ascii-only
// strings is also their number of letters, but in case
// we have non-ascii words in the future we should
// use this function to get the real letter count
export function countLetters(string: string): number {
	let count = 0;
	for (let _letter of string) {
		count += 1;
	}
	return count;
}
