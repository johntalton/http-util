import { Base32 } from '../util/base32.js'
import { FEATURE_TEMPORAL } from './defs.js'

/** @import { NumberType } from './defs.js' */

/**
 * @typedef {Object} ParsingFormat
 * @property {(list: Array<any>, parameters: Map<string, any>) => any} formatInnerList
 * @property {(dict: Map<string, any>) => any} formatDictionary
 * @property {(key: string) => any} formatKey
 * @property {(value: any, parameters: Map<string, any>) => any} formatDictionaryMember
 * @property {(bare_item: any, parameters: Map<string, any>) => any} formatItem
 * @property {(parameters: Map<string, any>) => any} formatParameters
 * @property {(n: number, type: NumberType) => any} formatNumber
 * @property {(str: string) => any} formatString
 * @property {(t: string) => any} formatToken
 * @property {(buffer: Uint8Array) => any} formatBinary
 * @property {(b: boolean) => any} formatBoolean
 * @property {(date: number) => any} formatDate
 * @property {(str: string) => any} formatDisplayString
 */

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
	 * @param {NumberType} _type
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
	 * @param {NumberType} _type
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
		if(FEATURE_TEMPORAL) {
			return Temporal.Instant.fromEpochMilliseconds(d * 1000)
		}

		return new Date(d * 1000)
	}

	/**
	 * @param {string} ds
	 */
	static formatDisplayString(ds) {
		return ds
	}
}

