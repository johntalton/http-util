import http2 from 'node:http2'
import {
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	HTTP_HEADER_SERVER_TIMING,
	ServerTiming
} from '../server-timing.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_NOT_MODIFIED
} = http2.constants

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} age
 * @param {Metadata} meta
 */
export function sendNotModified(stream, age, meta) {
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_NOT_MODIFIED,
		[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
		[HTTP2_HEADER_CACHE_CONTROL]: 'private',
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance),
		[HTTP2_HEADER_ETAG]: `"${meta.etag}"`,
		[HTTP2_HEADER_AGE]: age
	})
	stream.end()
}
