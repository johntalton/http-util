export const QUOTE = '"'

/**
 * @param {string|undefined} value
 */
export function stripQuotes(value) {
	if(value === undefined) { return undefined }
	return value.slice(1, -1)
}

/**
 * @param {string|undefined} value
 */
export function isQuoted(value) {
	if(value === undefined) { return false }
	if(value.length < 2) { return false }
	if(!value.startsWith(QUOTE)) { return false }
	if(!value.endsWith(QUOTE)) { return false }
	return true
}

/**
 * @param {string|number} value
 */
export function quoteValue(value) {
	return `${QUOTE}${value}${QUOTE}`
}
