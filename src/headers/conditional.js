/** biome-ignore-all lint/style/noExcessiveClassesPerFile: includes helper classes */
/** biome-ignore-all lint/style/noExcessiveLinesPerFile: includes temporal and date support */
import { COMMON_WILDCARD_ANY_ASTERISK, EMPTY } from '../defs.js'
import { Assert } from './util/assert.js'
import { isQuoted, stripQuotes } from './util/quote.js'

/**
 * @typedef {Object} WeakEtagItem
 * @property {true} weak
 * @property {false} any
 * @property {string} etag
 */

/**
 * @typedef {Object} AnyEtagItem
 * @property {boolean} weak
 * @property {true} any
 * @property {'*'} etag
 */

/**
 * @typedef {Object} NotWeakEtagItem
 * @property {false} weak
 * @property {false} any
 * @property {string} etag
 */

/** @typedef {WeakEtagItem | NotWeakEtagItem | AnyEtagItem } EtagItem */


export const CONDITION_ETAG_SEPARATOR = ','
export const CONDITION_ETAG_ANY = COMMON_WILDCARD_ANY_ASTERISK
export const CONDITION_ETAG_WEAK_PREFIX = 'W/'
export const ETAG_QUOTE = '"'

/** @type {AnyEtagItem} */
export const ANY_ETAG_ITEM = { any: true, weak: false, etag: CONDITION_ETAG_ANY }



export class ETag {
	/**
	 * @param {string|undefined} etag
	 * @returns {etag is string}
	 */
	static isValid(etag) {
		if(etag === undefined) { return false }
		// Assert.isString(etag)

		// %x21 / %x23-7E and %x80-FF
		for(const c of etag) {
			if(c.charCodeAt(0) < 0x21) { return false }
			if(c.charCodeAt(0) > 0xFF) { return false }
			if(c === ETAG_QUOTE) { return false }
		}
		return true
	}

	/**
	 * @param {string|undefined} etag
	 * @returns {WeakEtagItem}
	 */
	static weak(etag) {
		if(!ETag.isValid(etag)) { throw new TypeError('invalid etag format') }
		return { any: false, weak: true, etag }
	}

	/**
	 * @param {string|undefined} etag
	 * @returns {NotWeakEtagItem}
	 */
	static strong(etag) {
		if(!ETag.isValid(etag)) { throw new TypeError('invalid etag format') }
		return { any: false, weak: false, etag }
	}

	/**
	 * @returns {AnyEtagItem}
	 */
	static any() { return ANY_ETAG_ITEM }

	/**
	 * @param {string|undefined} raw
	 * @returns {EtagItem|undefined}
	 */
	static parse(raw) {
		if(raw === undefined) { return undefined }
		Assert.isString(raw)

		const rawEtag = raw.trim()
		const weak = rawEtag.startsWith(CONDITION_ETAG_WEAK_PREFIX)
		const quotedEtag = weak ? rawEtag.slice(CONDITION_ETAG_WEAK_PREFIX.length) : rawEtag

		if(quotedEtag === CONDITION_ETAG_ANY) { return ANY_ETAG_ITEM }

		if(!isQuoted(quotedEtag)) { return undefined }
		const etag = stripQuotes(quotedEtag)
		if(etag === undefined) { return undefined }
		if(etag === EMPTY) { return undefined }
		if(etag === CONDITION_ETAG_ANY) { return ANY_ETAG_ITEM } // todo: should this return undefined?
		if(!ETag.isValid(etag)) { return undefined }

		return {
			weak,
			any: false,
			etag
		}
	}

	/**
	 * @param {EtagItem} itemA
	 * @param {EtagItem} itemB
	 */
	static compareWeak(itemA, itemB) {
		if(itemA.any || itemB.any) { return true }
		return itemA.etag === itemB.etag
	}

	/**
	 * @param {EtagItem} itemA
	 * @param {EtagItem} itemB
	 */
	static compareStrong(itemA, itemB) {
		if(itemA.any || itemB.any) { return true }
		if(itemA.weak || itemB.weak) { return false }
		return itemA.etag === itemB.etag
	}
}

export class Conditional {
	/**
	 * @param {EtagItem|undefined} etagItem
	 * @returns {string|undefined}
	 */
	static encodeEtag(etagItem) {
		if(etagItem === undefined) { return undefined }
		if(etagItem.any) {
			if(etagItem.etag !== CONDITION_ETAG_ANY) { return undefined }
			return CONDITION_ETAG_ANY
		}

		if(etagItem.etag === CONDITION_ETAG_ANY) { return undefined }
		if(!ETag.isValid(etagItem.etag)) { return undefined }

		const prefix = etagItem.weak ? CONDITION_ETAG_WEAK_PREFIX : EMPTY
		return `${prefix}${ETAG_QUOTE}${etagItem.etag}${ETAG_QUOTE}`
	}

	/**
	 * @param {string|undefined} matchHeader
	 * @returns {Array<EtagItem>}
	 */
	static parseEtagList(matchHeader) {
		if(matchHeader === undefined) { return [] }
		Assert.isString(matchHeader)

		return matchHeader.split(CONDITION_ETAG_SEPARATOR)
			.map(ETag.parse)
			.filter(item => item !== undefined)
	}

	/**
	 * @param {Array<EtagItem>|undefined} etagItemList
	 * @returns {boolean}
	 */
	static hasAny(etagItemList) {
		if(etagItemList === undefined) { return false }
		return etagItemList.some(item => item.any)
	}

	/**
	 * @deprecated Assume Weak Comparison and uses string etag
	 * @param {Array<EtagItem>|undefined} etagItemList
	 * @param {string|undefined} etag
	 * @returns {boolean}
	 */
	static hasEtag(etagItemList, etag) {
		if(etagItemList === undefined) { return false }
		if(etag === undefined) { return false }

		Assert.isString(etag)

		return etagItemList.some(item => item.etag === etag)
	}

	/**
	 * @param {Array<EtagItem>|undefined} etagItemList
	 * @param {EtagItem|undefined} etagItem
	 * @param {boolean} strong
	 * @returns {boolean}
	 */
	static hasEtagItem(etagItemList, etagItem, strong) {
		if(etagItemList === undefined) { return false }
		if(etagItem === undefined) { return false }

		const compare = strong ? ETag.compareStrong : ETag.compareWeak

		return etagItemList.some(ei => compare(ei, etagItem))
	}
}
