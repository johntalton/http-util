import http2 from 'node:http2'

import { COMMON_LIST_VALUE_JOINER_COMMA } from '../defs.js'

import {
	HTTP_HEADER_SERVER_TIMING,
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	ServerTiming
} from '../headers/server-timing.js'

/** @import { OutgoingHttpHeaders } from 'node:http2' */
/** @import { Metadata } from '../defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_EXPOSE_HEADERS,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_STRICT_TRANSPORT_SECURITY
} = http2.constants

/**
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {Array<string>} exposedHeaders
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function coreHeaders(status, contentType, exposedHeaders, meta) {
	const exposed = [ HTTP2_HEADER_ETAG, HTTP2_HEADER_SERVER, ...exposedHeaders ] // todo include lastModified

	return {
		// todo [HTTP2_HEADER_STRICT_TRANSPORT_SECURITY]: StrictTransportSecurity.encode(meta.hsts)
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_ACCESS_CONTROL_EXPOSE_HEADERS]: exposed.join(COMMON_LIST_VALUE_JOINER_COMMA),
		// Access-Control-Allow-Credentials // for non-preflight
		[HTTP2_HEADER_STATUS]: status,
		[HTTP2_HEADER_CONTENT_TYPE]: contentType,
		[HTTP2_HEADER_SERVER]: meta.servername
	}
}

/**
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function performanceHeaders(meta) {
	return {
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance)
	}
}

/**
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function customHeaders(meta) {
	const CUSTOM_HEADER_PREFIX = 'X-'
	const m = new Map(meta.customHeaders?.filter(h => h[0].startsWith(CUSTOM_HEADER_PREFIX)))
	return Object.fromEntries(m)
}
