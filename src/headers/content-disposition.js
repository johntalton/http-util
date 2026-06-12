import { KVP } from './util/kvp.js'

/**
 * @typedef {Object} Disposition
 * @property {string} disposition
 * @property {Map<string, string|undefined>} parameters
 * @property {string|undefined} [name]
 * @property {string|undefined} [filename]
 */

export const DISPOSITION_PARAM_NAME = 'name'
export const DISPOSITION_PARAM_FILENAME = 'filename'

export class ContentDisposition {
	/**
	 * @param {string|undefined} header
	 * @returns {Disposition|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }

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
}
