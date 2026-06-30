export const QUOTE = '"'

/**
 * @param {string} value
 */
export function slashEncode(value) {
	return value
		.replaceAll(QUOTE, '\\"')
}

/**
 * @param {string} value
 */
export function slashDecode(value) {
	return value
		.replaceAll('\\"', QUOTE)
}

/**
 * @param {string|undefined} value
 */
export function stripQuotes(value) {
	if(value === undefined) { return undefined }
	const escapedValue = value.slice(1, -1)
	return slashDecode(escapedValue)
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
	const escapedValue = slashEncode(`${value}`)
	return `${QUOTE}${escapedValue}${QUOTE}`
}
