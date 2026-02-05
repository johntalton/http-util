import http2 from 'node:http2'
import {
	HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE,
	PREFLIGHT_AGE_SECONDS
} from './defs.js'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
	HTTP2_HEADER_IF_MATCH,
	HTTP2_HEADER_IF_NONE_MATCH,
	HTTP2_HEADER_AUTHORIZATION
} = http2.constants

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>} methods
 * @param {Metadata} meta
 */
export function sendPreflight(stream, methods, meta) {
	send(stream, HTTP_STATUS_OK, {
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS]: methods.join(','),
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS]: [
				HTTP2_HEADER_IF_MATCH,
				HTTP2_HEADER_IF_NONE_MATCH,
				HTTP2_HEADER_AUTHORIZATION,
				HTTP2_HEADER_CONTENT_TYPE
			].join(','),
			[HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE]: PREFLIGHT_AGE_SECONDS
			// Access-Control-Allow-Credentials
		}, [], undefined, undefined, meta)
}
