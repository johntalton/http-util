/** @import { Readable } from 'node:stream' */
/** @import { ReadableStream } from 'node:stream/web' */

/** @import { TimingsInfo } from './headers/server-timing.js' */
/** @import { EtagItem } from './headers/conditional.js' */
/** @import { IMFFixDateInput } from './headers/util/imf-fixdate.js' */
/** @import { CacheControlOptions } from './headers/cache-control.js' */
/** @import { ContentRangeDirective } from './headers/content-range.js' */
/** @import { RateLimitPolicyInfo, RateLimitInfo } from './headers/rate-limit.js' */
/** @import { DispositionInput } from './headers/content-disposition.js' */
/** @import { CSPPolicy } from './headers/content-security-policy.js'  */
/** @import { COEPItem } from './headers/cross-origin-embedder-policy.js'  */
/** @import { COOPDirective } from './headers/cross-origin-opener-policy.js'  */
/** @import { CORPDirective } from './headers/cross-origin-resource-policy.js'  */
/** @import { PermissionsPolicyItem } from './headers/permissions-policy.js'  */
/** @import { ReferrerPolicyDirective } from './headers/referrer-policy.js'  */
/** @import { IntegrityPolicyInput } from './headers/integrity-policy.js'  */
/** @import { ReportingEndpointsItem } from './headers/reporting-endpoints.js'  */
/** @import { SiteDataItem } from './headers/clear-site-data.js'  */
/** @import { ClientHintsDirective } from './headers/client-hints.js'  */
/** @import { LinkItem } from './headers/link.js'  */
/** @import { AppliedPreferencesInput } from './headers/preference.js'  */
/** @import { StrictTransportSecurityOptions } from './headers/strict-transport-security.js' */
/** @import { RetryAfterItem } from './headers/retry-after.js' */
/** @import { AutoDigestItem } from './headers/digest.js'  */
/** @import { UseAsDictionaryItem } from './headers/dictionary.js' */

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
 * @property {StrictTransportSecurityOptions|undefined} [HSTS]
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
 * @typedef {Object} SendDigest
 * @property {Array<AutoDigestItem>|AutoDigestItem|undefined} repr
 * @property {Array<AutoDigestItem>|AutoDigestItem|undefined} content
 * @property {Array<AutoDigestItem>|AutoDigestItem|undefined} unencoded
 */

/**
 * @typedef {Object} SendContent
 * @property {string|undefined} contentType
 * @property {number|undefined} contentLength
 * @property {DispositionInput|undefined} contentDisposition
 * @property {string|undefined} encoding
 * @property {EtagItem|undefined} etag
 * @property {IMFFixDateInput|string|undefined} lastModified
 * @property {number|undefined} age
 * @property {CacheControlOptions} cacheControl
 * @property {ContentRangeDirective} rangeDirective
 * @property {SendDigest|undefined} digest
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
 * @property {Array<string>|undefined} supportedHeaders list of additional headers to allow
 * @property {SendSupportedTypes} supportedTypes description of mime-types supported for post/put/patch methods
 * @property {Array<string>|string} acceptableTypes for content negotiation failures
 * @property {AcceptRangeUnits|undefined} acceptRanges
 * @property {Array<string>|undefined} supportedQueryTypes mime-types supported for query method
 * @property {RateLimitInfo} limitInfo
 * @property {Array<RateLimitPolicyInfo>} policies
 * @property {RetryAfterItem|undefined} retryAfter
 */

/** @typedef {{ reportOnly?: boolean|undefined }} ReportOnlyPolicy */

/**
 * @typedef {Object} ClientPolicyMap
 * @property {Array<CSPPolicy & ReportOnlyPolicy>|(CSPPolicy & ReportOnlyPolicy)|undefined} [CSP] Content Security Policy
 * @property {(COEPItem & ReportOnlyPolicy)|undefined} [COEP] Cross Origin Embedder Policy
 * @property {COOPDirective|undefined} [COOP] Cross Origin Opener Policy
 * @property {CORPDirective|undefined} [CORP] Cross Origin Resource Policy
 * @property {Array<PermissionsPolicyItem & ReportOnlyPolicy>|(PermissionsPolicyItem & ReportOnlyPolicy)|undefined} [permissions] Permissions Policy
 * @property {ReferrerPolicyDirective|undefined} [referrer] Referrer Policy
 * @property {(IntegrityPolicyInput & ReportOnlyPolicy)|undefined} [integrity] Integrity Policy
 * @property {ReportingEndpointsItem|undefined} [reportingEndpoints]
 */

/**
 * @typedef {Object} SendContext
 * @property {SiteDataItem|undefined} [clearSiteData]
 * @property {Array<ClientHintsDirective>|undefined} [acceptClientHints]
 * @property {Array<LinkItem>|LinkItem|undefined} [links]
 * @property {ClientPolicyMap|undefined} [policy]
 * @property {AppliedPreferencesInput|undefined} [appliedPreferences]
 * @property {IMFFixDateInput|undefined} [sunset]
 * @property {Date|Temporal.Instant|undefined} [deprecation]
 *
 * @property {RateLimitInfo|undefined} [rateLimitInfo]
 * @property {Array<RateLimitPolicyInfo>|undefined} [rateLimitPolicies]
 *
 * @property {string|undefined} [serviceWorkerAllowed]
 *
 * @property {UseAsDictionaryItem|undefined} [useAsDictionary]
 */

/** @type {''} */
export const EMPTY = ''

//
export const DEFAULT_METHODS = [ 'HEAD', 'GET', 'POST', 'PATCH', 'DELETE' ]

export const PREFLIGHT_AGE_SECONDS = '500'

//
export const CUSTOM_HEADER_PREFIX = 'X-'

/** @type {'bytes'} */
export const RANGE_UNITS_BYTES = 'bytes'
/** @type {'none'} */
export const RANGE_UNITS_NONE = 'none'

/** @description joiner used for concatenating multiple of the same headers into one */
export const COMMON_LIST_HEADER_JOINER_COMMA = ', '

/** @description joiner used for concatenating multiple values of single header */
export const COMMON_LIST_VALUE_JOINER_COMMA = ','

/** @description joiner used for concatenating multiple parameter values of single value header */
export const COMMON_LIST_PARAMETER_JOINER_SEMICOLON = '; '

export const COMMON_WILDCARD_ANY_ASTERISK = '*'

/**
 * @template T
 * @param {T} item
 * @returns {T extends undefined ? undefined : T extends Array<infer U> ? Array<Exclude<U, undefined>> : Array<T>}
 */
export function normalizeToArray(item) {
  if (item === undefined) { return /** @type {any} */ (undefined) }
  return /** @type {any} */ (Array.isArray(item) ? item.filter(i => i !== undefined) : [ item ])
}

/**
 * @template T
 * @param {Array<T>|undefined} arr
 * @returns {arr is NonEmptyArray<T>}
 */
export function isNonEmptyArray(arr) {
  if(arr === undefined) { return false }
	if(!Array.isArray(arr)) { return false }
  return arr.length > 0
}
