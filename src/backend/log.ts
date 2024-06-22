import isString from 'lodash-es/isString';

export function log(...args: any[]) {
	for (let arg of args) {
		if (isString(arg)) {
			console.log(arg);
		} else {
			console.dir(arg, { depth: null, colors: true });
		}
	}
}
