import { EMPTY } from '../../defs.js'
import { hasSpecialChar } from './mime.js'
import { isQuoted, quoteValue, stripQuotes } from './quote.js'

export const DEFAULT_DELIMITER = ';'
export const KVP_DELIMITER = '='

export class KVP {
	/**
	 * @param {Array<string>} params
	 * @param {Array<string>|undefined} [acceptableKeys=undefined]
	 */
	static #parse(params, acceptableKeys = undefined) {
		const parameters = new Map()

		// if(params === undefined) { return parameters }

		for(const kvp of params) {
			const [ rawKey, rawValue ] = kvp
				.split(KVP_DELIMITER)
				.map(p => p.trim())

			/* c8 ignore next */
			if(rawKey === undefined) { continue } // impossible as split always returns string
			if(rawKey === EMPTY) { continue }
			const key = rawKey.toLowerCase()
			if(hasSpecialChar(key)) { continue }

			if(acceptableKeys !== undefined && !acceptableKeys.includes(key)) { continue }

			const unquotedValue = isQuoted(rawValue) ? stripQuotes(rawValue) : rawValue
			const value = unquotedValue === EMPTY ? undefined : unquotedValue

			if(!parameters.has(key)) {
				parameters.set(key, value)
			}
		}

		return parameters
	}

	/**
	 * Parses Key Value pair parameter list with leading named item.
	 * @param {string|undefined} str
	 * @param {Array<string>|undefined} [acceptableKeys=undefined]
	 */
	static parse(str, acceptableKeys = undefined) {
		if(str === undefined) { return undefined }
		if(str === EMPTY) { return undefined }

		const [ name, ...params ] = str
			.trim()
			.split(DEFAULT_DELIMITER)
			.map(p => p.trim())

		if(name === EMPTY) { return undefined }

		const parameters = KVP.#parse(params, acceptableKeys)

		return { name, parameters }
	}

	/**
	 * Parses Key Value pair parameter list (no special treatment for leading key)
	 * @param {string|undefined} str
	 * @param {Array<string>|undefined} [acceptableKeys=undefined]
	 */
	static parseParameters(str, acceptableKeys = undefined) {
		if(str === undefined) { return undefined }
		if(str === EMPTY) { return undefined }

		const params = str
			.trim()
			.split(DEFAULT_DELIMITER)
			.map(p => p.trim())

		const parameters = KVP.#parse(params, acceptableKeys)

		return { parameters }
	}

	/**
	 * @param {string} key
	 * @param {string|number|undefined} value
	 * @param {boolean} [quote = false ]
	 */
	static encode(key, value, quote = false) {
		if(value === undefined) { return key }
		const qValue = quote ? quoteValue(value) : value
		return `${key}=${qValue}`
	}
}


