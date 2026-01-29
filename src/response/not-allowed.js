import http2 from 'node:http2'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ALLOW
} = http2.constants

const {
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>} methods
 * @param {Metadata} meta
 */
export function sendNotAllowed(stream, methods, meta) {
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_METHOD_NOT_ALLOWED,
		[HTTP2_HEADER_ALLOW]: methods.join(','),
		[HTTP2_HEADER_SERVER]: meta.servername
	})
	stream.end()
}