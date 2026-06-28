import { EMPTY } from '../../defs.js'

export class Assert {
	/**
	 * @param {unknown} value
	 * @param {string} [parameterName]
	 * @returns {value is string}
	 */
	static isString(value, parameterName) {
		if(value instanceof String) { return true }
		if(typeof value === 'string') { return true }

		throw new TypeError(`parameter${parameterName === undefined ? EMPTY : ` (${parameterName})`} must be a string`)
	}
}
