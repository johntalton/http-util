import http2 from 'node:http2'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_UNAUTHORIZED
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendUnauthorized(stream, meta) {
	console.log('Unauthorized')

	stream.respond({
		...coreHeaders(HTTP_STATUS_UNAUTHORIZED, undefined, meta),
		...performanceHeaders(meta)

		//  WWW-Authenticate
	})
	stream.end()
}
