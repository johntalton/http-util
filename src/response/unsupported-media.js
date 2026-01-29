import http2 from 'node:http2'
import { HTTP_HEADER_ACCEPT_POST } from './defs.js'
import {
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	HTTP_HEADER_SERVER_TIMING,
	ServerTiming
} from '../server-timing.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE
} = http2.constants

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>|string} acceptableMediaType
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, acceptableMediaType, meta) {
	const acceptable = Array.isArray(acceptableMediaType) ? acceptableMediaType : [ acceptableMediaType ]

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE,
		[HTTP_HEADER_ACCEPT_POST]: acceptable.join(','),
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance),
	})

	stream.end()
}