import http2 from 'node:http2'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_SERVER
} = http2.constants

const {
	HTTP_STATUS_UNAUTHORIZED
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendUnauthorized(stream, meta) {
	console.log('Unauthorized')

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_UNAUTHORIZED,
		[HTTP2_HEADER_SERVER]: meta.servername
	})
	stream.end()
}
