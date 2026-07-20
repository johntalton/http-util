import { Base32 } from './base32.js'

/** @import { ParsingFormat, ParsingNumberType } from './structured-field.js' */

/**
 * @see {@link https://github.com/httpwg/structured-field-tests}
 * @type {ParsingFormat}
 */
export class HTTPWGTestFormatter {
	/**
	 * @param {Array<any>} list
	 * @param {Map<string, any>} parameters
	 */
	static formatInnerList(list, parameters) {
		return [ list, parameters ]
	}

	/**
	 * @param {Map<string, any>} dict
	 */
	static formatDictionary(dict) {
		return [ ...dict.entries() ]
	}

	/**
	 * @param {string} key
	 */
	static formatKey(key) {
		return key
	}

	/**
	 * @param {any} value
	 * @param {Map<string, any>} parameters
	 */
	static formatDictionaryMember(value, parameters) {
		return [ value, parameters ]
	}

	/**
	 * @param {any} item
	 * @param {Map<string, any>} parameters
	 */
	static formatItem(item, parameters) {
		return [ item, parameters ]
	}

	/**
	 * @param {Map<string, any>} param
	 */
	static formatParameters(param) {
		return [ ...param.entries() ]
	}

	/**
	 * @param {number} n
	 * @param {ParsingNumberType} _type
	 */
	static formatNumber(n, _type) {
		return n
	}

	/**
	 * @param {string} s
	 */
	static formatString(s) {
		return s
	}

	/**
	 * @param {string} t
	 */
	static formatToken(t) {
		return { __type: 'token', value: t }
	}

	/**
	 * @param {Uint8Array} b
	 */
	static formatBinary(b) {
		return { __type: 'binary', value: Base32.encode(b) }
	}

	/**
	 * @param {boolean} b
	 */
	static formatBoolean(b) {
		return b
	}

	/**
	 * @param {number} d
	 */
	static formatDate(d) {
		return { __type: 'date', value: d }
	}

	/**
	 * @param {string} ds
	 */
	static formatDisplayString(ds) {
		return { __type: 'displaystring', value: ds }
	}
}

/**
 * @type {ParsingFormat}
 */
export class NativeFormatter {
	/**
	 * @param {Array<any>} inner_list
	 * @param {Map<string, any>} parameters
	 */
	static formatInnerList(inner_list, parameters) {
		return {
			inner_list,
			parameters
		}
	}

	/**
	 * @param {Map<string, any>} dict
	 */
	static formatDictionary(dict) {
		return dict
	}

	/**
	 * @param {string} k
	 */
	static formatKey(k) {
		return k
	}

	/**
	 * @param {any} value
	 * @param {Map<string, any>} parameters
	 */
	static formatDictionaryMember(value, parameters) {
		return { value, parameters }
	}

	/**
	 * @param {any} bare_item
	 * @param {Map<string, any>} parameters
	 */
	static formatItem(bare_item, parameters) {
		return {
			bare_item,
			parameters
		}
	}

	/**
	 * @param {Map<string, any>} param
	 */
	static formatParameters(param) {
		return param
	}

	/**
	 * @param {number} n
	 * @param {ParsingNumberType} _type
	 */
	static formatNumber(n, _type) {
		return n
	}

	/**
	 * @param {string} s
	 */
	static formatString(s) {
		return s
	}

	/**
	 * @param {string} t
	 */
	static formatToken(t) {
		return Symbol.for(t)
	}

	/**
	 * @param {Uint8Array} b
	 */
	static formatBinary(b) {
		return b
	}

	/**
	 * @param {boolean} b
	 */
	static formatBoolean(b) {
		return b
	}

	/**
	 * @param {number} d
	 */
	static formatDate(d) {
		return Temporal.Instant.fromEpochMilliseconds(d * 1000)
	}

	/**
	 * @param {string} ds
	 */
	static formatDisplayString(ds) {
		return ds
	}
}

