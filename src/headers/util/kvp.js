import { hasSpecialChar } from './mime.js'
import { isQuoted, stripQuotes } from './quote.js'

export const DEFAULT_DELIMITER = ';'
export const KVP_DELIMITER = '='
export const KVP_EMPTY = ''

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

			if(rawKey === undefined) { continue }
			if(rawKey === KVP_EMPTY) { continue }
			const key = rawKey.toLowerCase()
			if(hasSpecialChar(key)) { continue }

			if(acceptableKeys !== undefined && !acceptableKeys.includes(key)) { continue }

			const unquotedValue = isQuoted(rawValue) ? stripQuotes(rawValue) : rawValue
			const value = unquotedValue === KVP_EMPTY ? undefined : unquotedValue

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
		if(str === KVP_EMPTY) { return undefined }

		const [ name, ...params ] = str
			.trim()
			.split(DEFAULT_DELIMITER)
			.map(p => p.trim())

		if(name === '') { return undefined}

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
		if(str === KVP_EMPTY) { return undefined }

		const params = str
			.trim()
			.split(DEFAULT_DELIMITER)
			.map(p => p.trim())

		const parameters = KVP.#parse(params, acceptableKeys)

		return { parameters }
	}
}


