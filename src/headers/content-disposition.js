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

export class ContentDisposition {
	/**
	 * @param {string|undefined} header
	 * @returns {Disposition|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		Assert.isString(header)

		const { name: disposition, parameters } = KVP.parse(header) ?? { parameters: new Map() }
		if(disposition === undefined) { return undefined }

		const name = parameters.get(DISPOSITION_PARAM_NAME)
		const filename = parameters.get(DISPOSITION_PARAM_FILENAME)

		return {
			disposition,
			parameters,
			name, filename
		}
	}

	/**
	 * @param {DispositionInput} disposition
	 */
	static *#encode(disposition) {
		if(disposition.disposition === undefined) { return }

		yield disposition.disposition
		if(disposition.name !== undefined) { yield KVP.encode(DISPOSITION_PARAM_NAME, disposition.name, true) }
		if(disposition.filename !== undefined) { yield KVP.encode(DISPOSITION_PARAM_FILENAME, disposition.filename, true) }

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
