export const WHITESPACE_REGEX = /\s/u

/**
 * @param {string|undefined} c
 */
export function isWhitespace(c){
	if(c === undefined) { return false }
	return WHITESPACE_REGEX.test(c)
}
