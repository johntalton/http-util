import http2 from 'node:http2'
import {
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	HTTP_HEADER_SERVER_TIMING,
	ServerTiming
} from '../server-timing.js'

/** @import { OutgoingHttpHeaders } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_CONTENT_TYPE
} = http2.constants

/**
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function coreHeaders(status, contentType, meta) {
	return {
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		// Access-Control-Expose-Headers
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
