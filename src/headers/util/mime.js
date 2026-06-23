import { Assert } from "./assert.js"

/**
 * @typedef {Object} MimeItem
 * @property {string} mimetype
 * @property {string} type
 * @property {string} subtype
 */

export const MIME_SEPARATOR = { SUBTYPE: '/' }

export const MIME_ANY = '*'

//
export const SPECIAL_CHARS = [
	// special
	'(', ')',
	'<', '>',
	'[', ']',
	'{', '}',
	'@', ',', ';', ':',
	'\\', '"', '/', '?', '=', // '.',
	// '%', // '!', '$', '&', // # ^ * | ~ `
	// space
	' ', '\u000B', '\u000C',
	// control
	'\n', '\r', '\t'
]

/**
 * @param {string|undefined} value
 */
export function hasSpecialChar(value) {
	if(value === undefined) { return false }
	// todo Assert.isString() is this overkill here?
	for(const special of SPECIAL_CHARS) {
		if(value.includes(special)) { return true }
	}

	return false
}

export class Mime {
	/**
	 * @param {string|undefined} name
	 * @returns {MimeItem|undefined}
	 */
	static parse(name) {
		if(name === undefined) { return undefined }
		Assert.isString(name)
		if(name === '') { return undefined }

		const parts = name
			.trim() // leading space of type and trailing of subtype
			.split(MIME_SEPARATOR.SUBTYPE)
			.map(t => t.toLowerCase()) // all type/subtypes should be lower

		// protect against multiple slashes
		if(parts.length > 2) { return undefined }

		const [ type, candidateSubtype ] = parts

		if(type === undefined) { return undefined } // can not happen as split always returns one
		if(type === '') { return undefined }
		if(hasSpecialChar(type)) { return undefined }

		if(hasSpecialChar(candidateSubtype)) { return undefined }

		const subtype = (candidateSubtype === '') ? MIME_ANY : (candidateSubtype ?? MIME_ANY)

		return {
			mimetype: `${type}${MIME_SEPARATOR.SUBTYPE}${subtype}`,
			type,
			subtype
		}
	}

	/**
	 * @param {MimeItem} first
	 * @param {MimeItem} second
	 * @returns {boolean}
	 */
	static matches(first, second) {
		if(first === undefined) { return false }
		if(second === undefined) { return false }

		const matchType = first.type === second.type || first.type === MIME_ANY || second.type === MIME_ANY
		if(!matchType) { return false }

		const matchSubtype = first.subtype === second.subtype || first.subtype === MIME_ANY || second.subtype === MIME_ANY
		return matchSubtype
	}
}
