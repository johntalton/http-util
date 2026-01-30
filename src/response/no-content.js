import http2 from 'node:http2'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_NO_CONTENT
} = http2.constants

const {
	HTTP2_HEADER_ETAG
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendNoContent(stream, meta) {
	stream.respond({
		...coreHeaders(HTTP_STATUS_NO_CONTENT, undefined, meta),
		...performanceHeaders(meta),

		[HTTP2_HEADER_ETAG]: `"${meta.etag}"`
	})
	stream.end()
}