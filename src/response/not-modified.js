import http2 from 'node:http2'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL
} = http2.constants

const { HTTP_STATUS_NOT_MODIFIED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} age
 * @param {Metadata} meta
 */
export function sendNotModified(stream, age, meta) {
	send(stream, HTTP_STATUS_NOT_MODIFIED, {
			[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
			[HTTP2_HEADER_CACHE_CONTROL]: 'private',
			[HTTP2_HEADER_ETAG]: `"${meta.etag}"`,
			[HTTP2_HEADER_AGE]: `${age}`
		}, undefined, undefined, meta)
}
