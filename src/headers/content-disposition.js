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

/**
 * @deprecated
 * @see {@link ContentDisposition.parse}
 * @param {string|undefined} contentDispositionHeader
 * @returns {Disposition|undefined}
 */
export function parseContentDisposition(contentDispositionHeader) {
	return ContentDisposition.parse(contentDispositionHeader)
}

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

// console.log(parseContentDisposition())
// // console.log(parseContentDisposition(null))
// console.log(parseContentDisposition(''))
// console.log(parseContentDisposition('form-data'))
// console.log(parseContentDisposition('    form-data ; name'))
// console.log(parseContentDisposition('form-data; name="key"'))

// console.log(parseContentDisposition('inline'))
// console.log(parseContentDisposition('attachment'))
// console.log(parseContentDisposition('attachment; filename="file name.jpg"'))
// console.log(parseContentDisposition('attachment; filename*=UTF-8\'\'file%20name.jpg'))
// console.log(parseContentDisposition('attachment; filename*=UTF-8\'\'file%20name.jpg'))
// console.log(parseContentDisposition('form-data;title*=us-ascii\'en-us\'This%20is%20%2A%2A%2Afun%2A%2A%2A'))