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

export const CACHE_CONTROL_DIRECTIVE_PUBLIC = 'public'
export const CACHE_CONTROL_DIRECTIVE_PRIVATE = 'private'
export const CACHE_CONTROL_DIRECTIVE_MAX_AGE = 'max-age'
export const CACHE_CONTROL_DIRECTIVE_STALE_WHILE_REVALIDATE = 'stale-while-revalidate'
export const CACHE_CONTROL_DIRECTIVE_STALE_IF_ERROR = 'stale-if-error'


export class CacheControl {
	/**
	 * @param {CacheControlOptions} options
	 */
	static *#encode(options) {
		const {
			pub,
			priv,
			maxAge,
			directives,
			staleWhileRevalidate,
			staleIfError
		} = options

		if(pub !== undefined && pub && !priv) { yield CACHE_CONTROL_DIRECTIVE_PUBLIC }
		if(priv !== undefined && priv && !pub) { yield CACHE_CONTROL_DIRECTIVE_PRIVATE }

		const directivesList = normalizeToArray(directives)
		if(directivesList !== undefined) { yield* directivesList }

		if(maxAge !== undefined && Number.isInteger(maxAge) && maxAge >= 0) {
			yield KVP.encode(CACHE_CONTROL_DIRECTIVE_MAX_AGE, maxAge)
		}

		if(staleWhileRevalidate !== undefined && Number.isInteger(staleWhileRevalidate) && staleWhileRevalidate >= 0) {
			yield KVP.encode(CACHE_CONTROL_DIRECTIVE_STALE_WHILE_REVALIDATE, staleWhileRevalidate)
		}

		if(staleIfError !== undefined && Number.isInteger(staleIfError) && staleIfError >= 0) {
			yield KVP.encode(CACHE_CONTROL_DIRECTIVE_STALE_IF_ERROR, staleIfError)
		}
	}

	/**
	 * @param {CacheControlOptions|undefined} options
	 * @param {boolean} [asArray = false]
	 * @returns {Array<string>|string|undefined}
	 */
	static encode(options, asArray = false) {
		if(options === undefined) { return undefined }

		const result = Array.from(CacheControl.#encode(options))
		if(result.length === 0) { return undefined }

		return asArray ? result : result.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
