
export const HTTP_HEADER_ORIGIN = 'origin'
export const HTTP_HEADER_USER_AGENT = 'user-agent'
export const HTTP_HEADER_FORWARDED = 'forwarded'
export const HTTP_HEADER_SEC_CH_UA = 'sec-ch-ua'
export const HTTP_HEADER_SEC_CH_PLATFORM = 'sec-ch-ua-platform'
export const HTTP_HEADER_SEC_CH_MOBILE = 'sec-ch-ua-mobile'
export const HTTP_HEADER_SEC_FETCH_SITE = 'sec-fetch-site'
export const HTTP_HEADER_SEC_FETCH_MODE = 'sec-fetch-mode'
export const HTTP_HEADER_SEC_FETCH_DEST = 'sec-fetch-dest'

export const DEFAULT_METHODS = [ 'HEAD', 'GET', 'POST', 'PATCH', 'DELETE' ]

export const HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE = 'access-control-max-age'
export const PREFLIGHT_AGE_SECONDS = '500'


/** @import { TimingsInfo } from '../server-timing.js' */

/**
 * @typedef {Object} Metadata
 * @property {Array<TimingsInfo>} performance
 * @property {string|undefined} servername
 * @property {string|undefined} origin
 * @property {string|undefined} [etag]
 */

/**
 * @typedef {Object} SSEOptions
 * @property {boolean} [active]
 * @property {boolean} [bom]
 */

