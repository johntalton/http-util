
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
	// '%', // '!', '$', '&', // #  ^ * | ~ `
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
		// console.log('mime::parse', name)
		if(name === undefined) { return undefined }
		if(name === '') { return undefined }

		const parts = name
			.trim() // leading space of type and trailing of subtype
			.split(MIME_SEPARATOR.SUBTYPE)
			.map(t => t.toLowerCase()) // all type/subtypes should be lower

		// protect against multiple slashes
		if(parts.length > 2) { return undefined }

		const [ type, candidateSubtype ] = parts

		if(type === undefined) { return undefined }
		if(type === '') { return undefined }
		if(hasSpecialChar(type)) { return undefined }

		// if(candidateSubtype === undefined) { return undefined }
		// if(candidateSubtype === '') { return undefined }
		if(hasSpecialChar(candidateSubtype)) { return undefined }

		const subtype = (candidateSubtype === '') ? MIME_ANY : candidateSubtype ?? MIME_ANY

		return {
			mimetype: `${type}${MIME_SEPARATOR.SUBTYPE}${subtype ?? MIME_ANY}`,
			type,
			subtype
		}
	}
}
