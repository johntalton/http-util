import { COMMON_LIST_PARAMETER_JOINER_SEMICOLON } from '../defs.js'
import { Assert } from './util/assert.js'
import { KVP } from './util/kvp.js'

/**
 * @typedef {Object} Disposition
 * @property {string} disposition
 * @property {Map<string, string|undefined>} parameters
 * @property {string|undefined} [name]
 * @property {string|undefined} [filename]
 */

/** @typedef {Pick<Disposition, 'disposition'|'name'|'filename'> & Partial<Pick<Disposition, 'parameters'>>} DispositionInput */

export const DISPOSITION_FORM_DATA = 'form-data'
export const DISPOSITION_INLINE = 'inline'
export const DISPOSITION_ATTACHMENT = 'attachment'

export const DISPOSITION_PARAM_NAME = 'name'
export const DISPOSITION_PARAM_FILENAME = 'filename'
export const DISPOSITION_PARAM_FILENAME_EXTENDED = 'filename*'

/**
 * @param {string} filename
 */
export function fallbackFilenameSafe(filename) {
	if(filename === undefined) { return undefined }

	// todo is this the right way to make ascii-safe
	// there is a fold-to-ascii lib that used a lookup table
	//  and the charCodeAt method of splitting the string

	return filename
		.normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '') // drop diacritical marks
    .replace(/[^\x20-\x7E]/gu, '?')   // ascii only
    .replace(/[/\\%*:|"<>]/gu, '?')   // OS path safe
    .replace(/\?+/gu, '-')            // run of replacement
    .trim()

	// return filename
	// 	.normalize('NFD')
	// 	.replace(/[\u0300-\u036f]/gv, '')
	// 	.replace(/[^\x00-\x7F]/gv, '?')
	// 	.replace(/\?+/gv, '?')

	// return filename
	// 	.replace(/[^\x20-\x7E]/gv, '?')

	// return filename
	// 	.split('')
	// 	.map(c => c.charCodeAt(0) < 128 ? c : '?')
	// 	.join('')
}

export class ContentDisposition {
	/**
	 * @param {string|undefined} header
	 * @returns {Disposition|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		Assert.isString(header)

		const { name: rawDisposition, parameters } = KVP.parse(header) ?? { parameters: new Map() }
		if(rawDisposition === undefined) { return undefined }
		const disposition = rawDisposition.toLowerCase()

		const name = parameters.get(DISPOSITION_PARAM_NAME)
		const fallbackFilename = parameters.get(DISPOSITION_PARAM_FILENAME)

		// todo this is not exactly correct as the simple replace does not extract actual charset
		// const encodedFilename = parameters.get(DISPOSITION_PARAM_FILENAME_EXTENDED)
		// const filename = (encodedFilename === undefined) ?
		// 	fallbackFilename :
		// 	decodeURIComponent(encodedFilename.replace('UTF-8\'\'', ''))

		return {
			disposition,
			parameters,
			name,
			filename: fallbackFilename // todo use extended filename
		}
	}

	/**
	 * @param {DispositionInput} disposition
	 */
	static *#encode(disposition) {
		if(disposition.disposition === undefined) { return }

		yield disposition.disposition
		if(disposition.name !== undefined) { yield KVP.encode(DISPOSITION_PARAM_NAME, disposition.name, true) }

		if(disposition.filename !== undefined) {
			const fallbackFilename = fallbackFilenameSafe(disposition.filename)
			yield KVP.encode(DISPOSITION_PARAM_FILENAME, fallbackFilename, true)

			// todo this is just hacked in - charset is variable and the quotes could be a language
			if(fallbackFilename !== disposition.filename) {
				yield KVP.encode(DISPOSITION_PARAM_FILENAME_EXTENDED, 'UTF-8\'\'' + encodeURIComponent(disposition.filename))
			}
		}


		if(disposition.parameters === undefined) { return }
		for(const [ key, value ] of disposition.parameters) {
			yield KVP.encode(key, value, false) // do not quote by default?
		}
	}

	/**
	 * @param {DispositionInput|undefined} disposition
	 */
	static encode(disposition) {
		if(disposition === undefined) { return undefined }

		const result = Array.from(ContentDisposition.#encode(disposition))
		if(result.length === 0) { return undefined }

		return result.join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
	}
}
