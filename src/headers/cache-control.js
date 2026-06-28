import { COMMON_LIST_HEADER_JOINER_COMMA, normalizeToArray } from '../defs.js'
import { KVP } from './util/kvp.js'

/** @typedef {'no-cache'|'no-store'|'no-transform'|'must-revalidate'|'immutable'|'must-understand'} Directives */

/**
 * @typedef {Object} CacheControlOptions
 * @property {boolean|undefined} [priv]
 * @property {boolean|undefined} [pub]
 * @property {number|undefined} [maxAge]
 * @property {number|undefined} [staleWhileRevalidate]
 * @property {number|undefined} [staleIfError]
 * @property {Directives|Array<Directives>|undefined} [directives]
 */

export class CacheControl {
	/**
	 * @param {CacheControlOptions|undefined} options
	 * @param {boolean} [asArray = false]
	 * @returns {Array<string>|string|undefined}
	 */
	static encode(options, asArray = false) {
		if(options === undefined) { return undefined }

		const {
			pub,
			priv,
			maxAge,
			directives,
			staleWhileRevalidate,
			staleIfError
		} = options

		const result = []

		if(pub !== undefined && pub && !priv) { result.push('public') }
		if(priv !== undefined && priv && !pub) { result.push('private') }

		const directivesList = normalizeToArray(directives)
		if(directivesList !== undefined) {
			result.push(...directivesList)
		}

		if(maxAge !== undefined && Number.isInteger(maxAge) && maxAge >= 0) {
			result.push(KVP.encode('max-age', maxAge))
		}

		if(staleWhileRevalidate !== undefined && Number.isInteger(staleWhileRevalidate) && staleWhileRevalidate >= 0) {
			result.push(KVP.encode('stale-while-revalidate', staleWhileRevalidate))
		}

		if(staleIfError !== undefined && Number.isInteger(staleIfError) && staleIfError >= 0) {
			result.push(KVP.encode('stale-if-error', staleIfError))
		}

		//
		if(result.length === 0) { return undefined }

		return asArray ? result : result.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
