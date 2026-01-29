import http2 from 'node:http2'
import { CONTENT_TYPE_JSON } from '../content-type.js'
import {
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	HTTP_HEADER_SERVER_TIMING,
	ServerTiming
} from '../server-timing.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_CREATED
} = http2.constants

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_LOCATION
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL} location
 * @param {Metadata} meta
 */
export function sendCreated(stream, location, meta) {
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_CREATED,
		// [HTTP2_HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP2_HEADER_LOCATION]: location.href,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance),
	})

	// stream.write(JSON.stringify( ... ))

	stream.end()
}
