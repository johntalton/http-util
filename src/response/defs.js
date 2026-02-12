
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

export const HTTP_METHOD_QUERY = 'QUERY'
export const HTTP_HEADER_ACCEPT_QUERY = 'accept-query'

export const DEFAULT_METHODS = [ 'HEAD', 'GET', 'POST', 'PATCH', 'DELETE' ]

export const HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE = 'access-control-max-age'
export const PREFLIGHT_AGE_SECONDS = '500'

/** @type {'bytes'} */
export const RANGE_UNITS_BYTES = 'bytes'
/** @type {'none'} */
export const RANGE_UNITS_NONE = 'none'

/** @import { TimingsInfo } from '../server-timing.js' */

/**
 * @typedef {`X-${string}`} CustomHeaderKey
 */

/**
 * @typedef {Object} Metadata
 * @property {Array<TimingsInfo>} performance
 * @property {string|undefined} servername
 * @property {string|undefined} origin
 * @property {Array<[ CustomHeaderKey, string ]>} customHeaders
 */

/**
 * @typedef {Object} SSEOptions
 * @property {boolean} [active]
 * @property {boolean} [bom]
 */

