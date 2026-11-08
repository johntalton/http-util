import { normalizeToArray } from '../defs.js'
import { SF_FIELD_TYPE_ITEM, StructuredField } from './structured-field/index.js'

/**
 * @typedef {Object} UseAsDictionaryItem
 * @property {URLPattern|string} match
 * @property {string|Array<string>|undefined} [matchDest]
 * @property {string|undefined} [id]
 * @property {string|undefined} [type]
 * @property {number|undefined} [ttl]
 */

export const USE_AS_DICTIONARY_ITEM_MATCH = 'match'
export const USE_AS_DICTIONARY_ITEM_MATCH_DEST = 'match-dest'
export const USE_AS_DICTIONARY_ITEM_ID = 'id'
export const USE_AS_DICTIONARY_ITEM_TYPE = 'type'
export const USE_AS_DICTIONARY_ITEM_TTL = 'ttl'


export const USE_AS_DICTIONARY_DEFAULT_TYPE = 'raw'

/**
 * @param {any} pattern
 * @returns {pattern is URLPattern}
 */
export function isURLPattern(pattern) {
	if(typeof URLPattern === 'undefined') { return false }
	return (pattern instanceof URLPattern)
}

export class UseAsDictionary {
	/**
	 * @param {UseAsDictionaryItem|undefined} item
	 * @returns {string|undefined}
	 */
	static encode(item) {
		if(item === undefined) { return undefined }
		if(item.match === undefined) { return undefined }

		const structure = new Map()

		if(isURLPattern(item.match)) {
			//
			if(item.match.hasRegExpGroups) { return undefined }

			const pattern = `${item.match.pathname}` // todo should include other parts
			structure.set(USE_AS_DICTIONARY_ITEM_MATCH, { value: pattern })
		}
		else {
			structure.set(USE_AS_DICTIONARY_ITEM_MATCH, { value: item.match })
		}

		if(item.matchDest !== undefined) {
			const matchDestList = normalizeToArray(item.matchDest)
				.map(dest => ({ value: dest }))
			structure.set(USE_AS_DICTIONARY_ITEM_MATCH_DEST, { value: matchDestList })
		}

		if(item.id !== undefined) { structure.set(USE_AS_DICTIONARY_ITEM_ID, { value: item.id }) }
		if(item.type !== undefined) { structure.set(USE_AS_DICTIONARY_ITEM_TYPE, { value: item.type, type: 'token' }) }

		if(item.ttl !== undefined && Number.isInteger(item.ttl)) { structure.set(USE_AS_DICTIONARY_ITEM_TTL, { value: item.ttl }) }

		try {
			return StructuredField.encode(structure)
		}
		catch {
			return undefined
		}
	}
}

export class DictionaryID {
	/**
	 * @param {string|undefined} header
	 * @returns {string|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }

		try {
			const { bare_item, parameters } = StructuredField.parse(header, SF_FIELD_TYPE_ITEM)
			if(typeof bare_item !== 'string') { return undefined }
			return bare_item
		}
		catch {
			return undefined
		}
	}

	/**
	 * @param {string|undefined} did
	 * @returns {string|undefined}
	 */
	static encode(did) {
		if(did === undefined) { return undefined }

		try {
			return StructuredField.encode({ value: did, type: 'string' })
		}
		catch {
			return undefined
		}
	}
}

export class AvailableDictionary {
	/**
	 * @param {string|undefined} header
	 * @returns {Uint8Array|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }

		try {
			const { bare_item, parameters } = StructuredField.parse(header, SF_FIELD_TYPE_ITEM)
			if(!(ArrayBuffer.isView(bare_item) || (bare_item instanceof ArrayBuffer))) { return undefined }
			return bare_item
		}
		catch {
			return undefined
		}
	}

	/**
	 * @param {ArrayBufferView|undefined} ad
	 * @returns {string|undefined}
	 */
	static encode(ad) {
		if(ad === undefined) { return undefined }
		if(!((ad instanceof ArrayBuffer) || ArrayBuffer.isView(ad))) { return undefined}
		if(ad.byteLength === 0) { return undefined }

		try {
			return StructuredField.encode({ value: ad, type: 'binary' })
		}
		catch {
			return undefined
		}
	}
}
