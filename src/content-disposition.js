/**
 * @typedef {Object} Disposition
 * @property {string} disposition
 * @property {Map<string, string>} parameters
 * @property {string} [name]
 * @property {string} [filename]
 */

export const DISPOSITION_SEPARATOR = {
	PARAMETER: ';',
	KVP: '='
}

export const DISPOSITION_PARAM_NAME = 'name'
export const DISPOSITION_PARAM_FILENAME = 'filename'

/**
 * @param {string} contentDispositionHeader
 * @returns {Disposition|undefined}
 */
export function parseContentDisposition(contentDispositionHeader) {
	if(contentDispositionHeader === undefined) { return undefined }

	const [ disposition, ...parameterSet ] = contentDispositionHeader.trim().split(DISPOSITION_SEPARATOR.PARAMETER).map(entry => entry.trim())
	const parameters = new Map(parameterSet.map(parameter => {
		const [ key, value ] = parameter.split(DISPOSITION_SEPARATOR.KVP).map(p => p.trim())
		return [ key, value ]
	}))

	const name = parameters.get(DISPOSITION_PARAM_NAME)
	const filename = parameters.get(DISPOSITION_PARAM_FILENAME)

	return {
		disposition,
		parameters,
		name, filename
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