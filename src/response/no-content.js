import http2 from 'node:http2'
import { send } from './send-util.js'

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
	send(stream, HTTP_STATUS_NO_CONTENT, {
			[HTTP2_HEADER_ETAG]: `"${meta.etag}"`
		}, undefined, undefined, meta)
}