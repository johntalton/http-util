import http2 from 'node:http2'
import { HTTP_HEADER_ACCEPT_POST } from './defs.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>|string} acceptableMediaType
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, acceptableMediaType, meta) {
	const acceptable = Array.isArray(acceptableMediaType) ? acceptableMediaType : [ acceptableMediaType ]

	stream.respond({
		...coreHeaders(HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE, undefined, meta),
		...performanceHeaders(meta),

		[HTTP_HEADER_ACCEPT_POST]: acceptable.join(',')
	})

	stream.end()
}