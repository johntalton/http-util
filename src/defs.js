/** @import { Readable } from 'node:stream' */
/** @import { ReadableStream } from 'node:stream/web' */

/** @import { TimingsInfo } from './headers/server-timing.js' */
/** @import { EtagItem, IMFFixDateInput } from './headers/conditional.js' */
/** @import { CacheControlOptions } from './headers/cache-control.js' */
/** @import { ContentRangeDirective } from './headers/content-range.js' */
/** @import { RateLimitPolicyInfo, RateLimitInfo } from './headers/rate-limit.js' */

/**
 * @template T
 * @typedef {[ T, ...T[] ]} NonEmptyArray
 */

/** @typedef {RANGE_UNITS_BYTES | RANGE_UNITS_NONE} AcceptRangeUnits */

/** @typedef {`X-${string}`} CustomHeaderKey */

/**
 * @typedef {Object} Metadata
 * @property {Array<TimingsInfo>} performance
 * @property {string|undefined} servername
 * @property {string|undefined} origin
 * @property {Array<[ CustomHeaderKey, string | Array<string> ]>|undefined} [customHeaders]
 */

/**
 * @typedef {Object} SSEOptions
 * @property {boolean} [active]
 * @property {boolean} [bom]
 */

/** @typedef {NodeJS.TypedArray<ArrayBuffer>} TypedArray */
/** @typedef {ArrayBuffer | TypedArray | string} SendBodyTypes */
/** @typedef { SendBodyTypes | ReadableStream<SendBodyTypes> | Readable } SendBody */

/**
 * @typedef {Object} SendContent
 * @property {string|undefined} contentType
 * @property {number|undefined} contentLength
 * @property {string|undefined} encoding
 * @property {EtagItem|undefined} etag
 * @property {IMFFixDateInput|string|undefined} lastModified
 * @property {number|undefined} age
 * @property {CacheControlOptions} cacheControl
 * @property {ContentRangeDirective} rangeDirective
 */

/**
 * @typedef {Object} SendSupportedTypesNormalizedRecord
 * @property {Array<string>|undefined} put
 * @property {Array<string>|undefined} post
 * @property {Array<string>|undefined} patch
 */

/**
 * @typedef {Object} SendSupportedTypeRecord
 * @property {Array<string>|string|undefined} [put]
 * @property {Array<string>|string|undefined} [post]
 * @property {Array<string>|string|undefined} [patch]
 */

/** @typedef {SendSupportedTypeRecord|Array<string>|string} SendSupportedTypes */

/**
 * @typedef {Object} SendInfo
 * @property {Array<string>} supportedMethods list of methods supported by this route
 * @property {SendSupportedTypes} supportedTypes description of mime-types supported for post/put/patch methods
 * @property {Array<string>|string} acceptableTypes for content negotiation failures
 * @property {AcceptRangeUnits|undefined} acceptRanges
 * @property {Array<string>|undefined} supportedQueryTypes mime-types supported for query method
 * @property {RateLimitInfo} limitInfo
 * @property {Array<RateLimitPolicyInfo>} policies
 * @property {number|undefined} retryAfter
 */

export const HTTP_HEADER_ORIGIN = 'origin'
export const HTTP_HEADER_USER_AGENT = 'user-agent'
export const HTTP_HEADER_FORWARDED = 'forwarded'
export const HTTP_HEADER_SEC_CH_UA = 'sec-ch-ua'
export const HTTP_HEADER_SEC_CH_PLATFORM = 'sec-ch-ua-platform'
export const HTTP_HEADER_SEC_CH_MOBILE = 'sec-ch-ua-mobile'
export const HTTP_HEADER_SEC_FETCH_SITE = 'sec-fetch-site'
export const HTTP_HEADER_SEC_FETCH_MODE = 'sec-fetch-mode'
export const HTTP_HEADER_SEC_FETCH_DEST = 'sec-fetch-dest'
export const HTTP_HEADER_ACCEPT_POST = 'accept-post'
export const HTTP_HEADER_ACCEPT_PATCH = 'accept-patch'
export const HTTP_HEADER_CLEAR_SITE_DATE = 'clear-site-data'
export const HTTP_HEADER_PREFERENCE_APPLIED = 'preference-applied'

export const HTTP_METHOD_QUERY = 'QUERY'
export const HTTP_HEADER_ACCEPT_QUERY = 'accept-query'

export const DEFAULT_METHODS = [ 'HEAD', 'GET', 'POST', 'PATCH', 'DELETE' ]

export const HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE = 'access-control-max-age'
export const PREFLIGHT_AGE_SECONDS = '500'

/** @type {'bytes'} */
export const RANGE_UNITS_BYTES = 'bytes'
/** @type {'none'} */
export const RANGE_UNITS_NONE = 'none'

/** @description joiner used for concatenating multiple of the same headers into one */
export const COMMON_LIST_HEADER_JOINER_COMMA = ', '

/** @description joiner used for concatenating multiple values of single header */
export const COMMON_LIST_VALUE_JOINER_COMMA = ','

/**
 * @template T
 * @param {Array<T>|T|undefined} item
 * @returns {Array<T>|undefined}
 */
export function normalizeToArray(item) {
	if(item === undefined) { return undefined }
	if(Array.isArray(item)) { return item }
	return [ item ]
}

/**
 * @template T
 * @param {Array<T>} arr
 * @returns {arr is NonEmptyArray<T>}
 */
export function isNonEmptyArray(arr) {
	if(!Array.isArray(arr)) { return false }
  return arr.length > 0
}
