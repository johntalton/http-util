import http2 from 'node:http2'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
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
		...coreHeaders(HTTP_STATUS_METHOD_NOT_ALLOWED, undefined, meta),
		...performanceHeaders(meta),

		[HTTP2_HEADER_ALLOW]: methods.join(',')
	})
	stream.end()
}