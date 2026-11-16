import {
	COMMON_LIST_HEADER_JOINER_COMMA,
	COMMON_LIST_VALUE_JOINER_COMMA,
	EMPTY,
	normalizeToArray,
} from '../defs.js'
import { Assert } from './util/assert.js'
import { KVP } from './util/kvp.js'

export const CACHE_CONTROL_REQUEST_SINGLETON_DIRECTIVES = /** @type {const} */ ([
	'no-cache',
	'no-store',
	'no-transform',
	'only-if-cached'
])

/** @typedef {typeof CACHE_CONTROL_REQUEST_SINGLETON_DIRECTIVES[number]} RequestDirectives */

/**
 * @typedef {Object} CacheControlRequestItem
 * @property {number|undefined} [maxAge]
 * @property {number|undefined} [maxStale]
 * @property {number|undefined} [minFresh]
 * @property {Array<RequestDirectives>} directives
 */

export const CACHE_CONTROL_RESPONSE_SINGLETON_DIRECTIVES = /** @type {const} */ ([
	'must-revalidate',
	'must-understand',
	'no-store',
	'no-transform',
	'proxy-revalidate',
	'public',
	'immutable',

	// legacy singletons
	'no-cache',
	'private'
])

/** @typedef {typeof CACHE_CONTROL_RESPONSE_SINGLETON_DIRECTIVES[number]} ResponseDirectives */

/**
 * @typedef {Object} CacheControlResponseItem
 * @property {number|undefined} [maxAge]
 * @property {Array<string>|string|boolean|undefined} [noCache]
 * @property {true} [pub]
 * @property {Array<string>|string|true|undefined} [priv]
 * @property {number|undefined} [staleWhileRevalidate]
 * @property {number|undefined} [staleIfError]
 * @property {ResponseDirectives|Array<ResponseDirectives>|undefined} [directives]
 */



export const CACHE_CONTROL_HEADER_SEPARATOR = ','

export const CACHE_CONTROL_DIRECTIVE_PUBLIC = 'public'
export const CACHE_CONTROL_DIRECTIVE_PRIVATE = 'private'
export const CACHE_CONTROL_DIRECTIVE_MAX_AGE = 'max-age'
export const CACHE_CONTROL_DIRECTIVE_STALE_WHILE_REVALIDATE = 'stale-while-revalidate'
export const CACHE_CONTROL_DIRECTIVE_STALE_IF_ERROR = 'stale-if-error'
export const CACHE_CONTROL_DIRECTIVE_MAX_STALE = 'max-stale'
export const CACHE_CONTROL_DIRECTIVE_MIN_FRESH = 'min-fresh'
export const CACHE_CONTROL_DIRECTIVE_NO_CACHE = 'no-cache'

/**
 * @param {string|undefined} directive
 * @returns {directive is Directives}
 */
export function isSingletonRequestDirective(directive) {
	if(directive === undefined) { return false }
	return /** @type {readonly string[]} */ (CACHE_CONTROL_REQUEST_SINGLETON_DIRECTIVES).includes(directive)
}

/**
 * @see {@link https://www.iana.org/assignments/http-cache-directives}
 * @see {@link https://www.rfc-editor.org/info/rfc9111/#section-5.2.1}
 */
export class CacheControl {
	/**
	 * @param {string|undefined} header
	 * @returns {CacheControlRequestItem|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		Assert.isString(header)

		/** @type {CacheControlRequestItem} */
		const cacheControl = {}

		if(header === EMPTY) { return cacheControl }

		const directives = new Map(
			header.split(CACHE_CONTROL_HEADER_SEPARATOR)
				.map(item => KVP.parseParameters(item) ?? { parameters: new Map() })
				.flatMap(({ parameters }) => [ ...parameters.entries() ])
		)

		console.log(directives)


		if(directives.has(CACHE_CONTROL_DIRECTIVE_MAX_AGE)) {
			const value = directives.get(CACHE_CONTROL_DIRECTIVE_MAX_AGE)
			const num = Number.parseInt(value, 10)
			if(!Number.isNaN(num) && num > 0) {
				cacheControl.maxAge = num
			}
			directives.delete(CACHE_CONTROL_DIRECTIVE_MAX_AGE)
		}

		if(directives.has(CACHE_CONTROL_DIRECTIVE_MAX_STALE)) {
			const value = directives.get(CACHE_CONTROL_DIRECTIVE_MAX_STALE)
			const num = Number.parseInt(value, 10)
			if(!Number.isNaN(num) && num > 0) {
				cacheControl.maxStale = num
			}
			directives.delete(CACHE_CONTROL_DIRECTIVE_MAX_STALE)
		}

		if(directives.has(CACHE_CONTROL_DIRECTIVE_MIN_FRESH)) {
			const value = directives.get(CACHE_CONTROL_DIRECTIVE_MIN_FRESH)
			const num = Number.parseInt(value, 10)
			if(!Number.isNaN(num) && num > 0) {
				cacheControl.minFresh = num
			}
			directives.delete(CACHE_CONTROL_DIRECTIVE_MIN_FRESH)
		}


		//
		const grouped = Map.groupBy(directives.entries(), ([ key ]) => isSingletonRequestDirective(key))
		cacheControl.directives = grouped.get(true)?.map(([ key ]) => key) ?? []


		return cacheControl
	}

	/**
	 * @param {CacheControlResponseItem} options
	 */
	static *#encode(options) {
		const {
			maxAge,
			noCache,
			pub,
			priv,
			staleWhileRevalidate,
			staleIfError,
			directives
		} = options

		/** @type {Array<ResponseDirectives>|undefined} */
		const rawDirectives = normalizeToArray(directives)

		const directivesList = new Set(rawDirectives
			?.filter(item => {
				if(item === CACHE_CONTROL_DIRECTIVE_PUBLIC) { return false }
				if(item === CACHE_CONTROL_DIRECTIVE_PRIVATE) { return false }
				if(item === CACHE_CONTROL_DIRECTIVE_NO_CACHE && noCache !== undefined) { return false }
				return true
			})
		).keys().toArray()

		const isPublic = (pub !== undefined && pub === true) || rawDirectives?.includes(CACHE_CONTROL_DIRECTIVE_PUBLIC)
		const isPrivate = (priv !== undefined && priv !== false) || rawDirectives?.includes(CACHE_CONTROL_DIRECTIVE_PRIVATE)

		if(isPublic && !isPrivate) {
			yield CACHE_CONTROL_DIRECTIVE_PUBLIC
		}

		if(isPrivate && !isPublic) {
			if(priv === undefined || priv === true) { yield CACHE_CONTROL_DIRECTIVE_PRIVATE }
			else {
				const privStr = normalizeToArray(priv).join(COMMON_LIST_VALUE_JOINER_COMMA)
				yield KVP.encode(CACHE_CONTROL_DIRECTIVE_PRIVATE, privStr, true)
			}
		}

		if(noCache !== undefined) {
			if(noCache === true) { yield CACHE_CONTROL_DIRECTIVE_NO_CACHE }
			else {
				const noCacheStr = normalizeToArray(noCache).join(COMMON_LIST_VALUE_JOINER_COMMA)
				yield KVP.encode(CACHE_CONTROL_DIRECTIVE_NO_CACHE, noCacheStr, true)
			}
		}

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
	 * @overload
	 * @param {CacheControlResponseItem|undefined} options
	 * @param {true} asArray
	 * @returns {Array<string>|undefined}
	 */
	/**
	 * @overload
	 * @param {CacheControlResponseItem|undefined} options
	 * @param {false} [asArray]
	 * @returns {string|undefined}
	 */
	/**
	 * @param {CacheControlResponseItem|undefined} options
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
