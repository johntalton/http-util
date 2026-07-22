

/** @typedef {'list'|'dictionary'|'item'} FieldType */

/** @typedef {'integer'|'decimal'} NumberType */

/** @typedef {NumberType|'string'|'token'|'boolean'|'binary'|'date'|'displaystring'} BareType */

//
export const SF_NUMBER_TYPE_INTEGER = 'integer'
export const SF_NUMBER_TYPE_DECIMAL = 'decimal'

//
export const SF_SPACE = ' '
export const SF_EMPTY = ''

//
export const PARSING_INPUT_JOINER = ', '

//
export const SF_ASTERISK = '*'
export const SF_AMPERSAND = '@'
export const SF_COLON = ':'
export const SF_DASH = '-'
export const SF_DOUBLE_QUOTE = '"'
export const SF_EQUALS = '='
export const SF_FORWARD_SLASH = '/'
export const SF_INNER_LIST_CLOSE = ')'
export const SF_INNER_LIST_OPEN = '('
export const SF_PERCENT = '%'
export const SF_PERIOD = '.'
export const SF_QUESTION_MARK = '?'
export const SF_SEMI_COLON = ';'
export const SF_UNDERSCORE = '_'

//
export const SF_BOOLEAN_ONE = '1'
export const SF_BOOLEAN_ZERO = '0'

//
export const BINARY_ALPHABET = 'base64'

//
export const SF_MIN_INT = -999_999_999_999_999
export const SF_MAX_INT = 999_999_999_999_999

export const SF_MAX_DECIMAL_WHOLE = 999_999_999_999

export const SF_MAX_DECIMAL_PLACE = 3

export const ZERO_REPLACING_REGEX = /0+$/v

/**
 * @param {number} n
 */
export function isDecimal(n) {
	if(typeof n !== 'number') { return false }
	return !Number.isInteger(n)
}

/**
 * @see {@link https://www.rfc-editor.org/info/rfc5234#appendix-B.1}
 * @param {string|undefined} c
 */
export function isLCAlpha(c) {
	if(c === undefined) { return false }
	const cc = c.charCodeAt(0)
	return (cc >= 0x61) && (cc <= 0x7A)
}

/**
 * @see {@link https://www.rfc-editor.org/info/rfc5234#appendix-B.1}
 * @param {string|undefined} c
 */
export function isDigit(c) {
	// %x30-39
	if(c === undefined) { return false }
	const cc = c.charCodeAt(0)
	return (cc >= 0x30) && (cc <= 0x39)
}

/**
 * @param {number} num
 */
export function roundBankers(num) {
	const scaled = Math.abs(num) * 1000
	const floor = Math.floor(scaled)
	const isHalf = Math.abs((scaled - floor) - 0.5) < 1e-9
  if(isHalf) { return (floor % 2 === 0 ? floor : floor + 1) }
	return Math.round(scaled)
}

/**
 * @see {@link https://www.rfc-editor.org/info/rfc5234#appendix-B.1}
 * @param {string|undefined} c
 */
export function isVChar(c) {
	// %x21-7E ; visible (printing) characters
	if(c === undefined) { return false }
	const cc = c.charCodeAt(0)
	return (cc >= 0x21) && (cc <= 0x7E)
}


/**
 * @see {@link https://www.rfc-editor.org/info/rfc5234#appendix-B.1}
 * @param {string|undefined} c
 */
export function isSP(c) {
	return c === SF_SPACE
}

/**
 * @see {@link https://www.rfc-editor.org/info/rfc5234#appendix-B.1}
 * @param {string|undefined} c
 */
export function isAlpha(c) {
	// %x41-5A / %x61-7A ; A-Z / a-z
	if(c === undefined) { return false }
	const cc = c.charCodeAt(0)
	return ((cc >= 0x41) && (cc <= 0x5A)) || ((cc >= 0x61) && (cc <= 0x7A))
}


/**
 * @see {@link https://www.rfc-editor.org/info/rfc9110#section-5.6.2}
 * @param {string|undefined} c
 */
export function isTChar(c) {
	const TCHAR_SYMBOLS = [
		'!', '#', '$', '%', '&', '\'', '*', '+', '-', '.',
		 '^', '_', '`', '|', '~'
	]
	// "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+" / "-" / "." /
	//  "^" / "_" / "`" / "|" / "~" / DIGIT / ALPHA
	if(c === undefined) { return false }
	if(isAlpha(c)) { return true }
	if(isDigit(c)) { return true }

	return TCHAR_SYMBOLS.includes(c)
}
