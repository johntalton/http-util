import http2 from 'node:http2'

import {
	HTTP_HEADER_ACCEPT_QUERY,
	HTTP_METHOD_QUERY,
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
	HTTP2_HEADER_AUTHORIZATION,
	HTTP2_HEADER_ACCEPT_RANGES,
	HTTP2_HEADER_RANGE,
	HTTP2_HEADER_IF_RANGE
} = http2.constants

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>} methods
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {'byte'|'none'|undefined} acceptRanges
 * @param {Metadata} meta
 */
export function sendPreflight(stream, methods, supportedQueryTypes, acceptRanges, meta) {
	const supportsQuery = methods.includes(HTTP_METHOD_QUERY) && supportedQueryTypes !== undefined && supportedQueryTypes.length > 0
	const exposedHeadersAcceptQuery = supportsQuery ? [ HTTP_HEADER_ACCEPT_QUERY ] : []
	const exposedHeaders = acceptRanges !== undefined ? [ HTTP2_HEADER_ACCEPT_RANGES, ...exposedHeadersAcceptQuery ] : exposedHeadersAcceptQuery

	send(stream, HTTP_STATUS_OK, {
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS]: methods.join(','),
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS]: [
				HTTP2_HEADER_IF_MATCH,
				HTTP2_HEADER_IF_NONE_MATCH,
				HTTP2_HEADER_AUTHORIZATION,
				HTTP2_HEADER_CONTENT_TYPE,
				HTTP2_HEADER_RANGE,
				HTTP2_HEADER_IF_RANGE
			].join(','),
			[HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE]: PREFLIGHT_AGE_SECONDS,
			[HTTP2_HEADER_ACCEPT_RANGES]: acceptRanges,
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(',')
			// Access-Control-Allow-Credentials
		}, exposedHeaders, undefined, undefined, meta)
}
