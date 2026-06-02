export const WHITESPACE_REGEX = /\s/

/**
 * @param {string} c
 */
export function isWhitespace(c){
	return WHITESPACE_REGEX.test(c)
}
