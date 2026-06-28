import { COMMON_WILDCARD_ANY_ASTERISK } from '../defs.js'
import { Assert } from './util/assert.js'
import { KVP } from './util/kvp.js'

export const FORWARDED_KEY_BY = 'by'
export const FORWARDED_KEY_FOR = 'for'
export const FORWARDED_KEY_HOST = 'host'
export const FORWARDED_KEY_PROTO = 'proto'

export const KNOWN_FORWARDED_KEYS = [
	FORWARDED_KEY_BY,
	FORWARDED_KEY_FOR,
	FORWARDED_KEY_HOST,
	FORWARDED_KEY_PROTO
]

export const SKIP_ANY = COMMON_WILDCARD_ANY_ASTERISK

export const FORWARDED_SEPARATOR = {
	ITEM: ','
}
export class Forwarded {
	/**
	 * @param {string|undefined} header
	 * @param {Array<string>} acceptedKeys
	 * @returns {Array<Map<string, string>>}
	 */
	static parse(header, acceptedKeys = KNOWN_FORWARDED_KEYS) {
		if(header === undefined) { return [] }
		Assert.isString(header)

		return header
			.trim()
			.split(FORWARDED_SEPARATOR.ITEM)
			.map(single => KVP.parseParameters(single, acceptedKeys)?.parameters)
			.filter(m => m !== undefined)
			.filter(m => m.size > 0)
			.filter(m => m.get(FORWARDED_KEY_FOR) !== undefined)
	}

	/**
	 * @param {Array<Map<string, string>>} forwardedList
	 * @param {Array<string>} skipList list of for values starting with right-most to skip in forwarded list
	 * @returns {Map<string, string>|undefined}
	 */
	static selectRightMost(forwardedList, skipList = []) {
		if(forwardedList === undefined) { return undefined }

		const iter = skipList[Symbol.iterator]()

		for(const forwarded of forwardedList.toReversed()) {
			const forValue = forwarded.get(FORWARDED_KEY_FOR)
			const { done, value } = iter.next()
			if(done) { return forwarded }
			if(value !== SKIP_ANY && value !== forValue) { return undefined }
		}

		return undefined
	}
}
