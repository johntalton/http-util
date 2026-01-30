import http2 from 'node:http2'
import { CONTENT_TYPE_JSON } from '../content-type.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_CREATED
} = http2.constants

const {
	HTTP2_HEADER_LOCATION
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL} location
 * @param {Metadata} meta
 */
export function sendCreated(stream, location, meta) {
	stream.respond({
		...coreHeaders(HTTP_STATUS_CREATED, undefined, meta),
		...performanceHeaders(meta),

		[HTTP2_HEADER_LOCATION]: location.href

	})

	// stream.write(JSON.stringify( ... ))

	stream.end()
}
