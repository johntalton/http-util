import http2 from 'node:http2'
import { CONTENT_TYPE_JSON } from '../content-type.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
  HTTP_STATUS_ACCEPTED
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendAccepted(stream, meta) {
	stream.respond({
		...coreHeaders(HTTP_STATUS_ACCEPTED, undefined, meta),
		...performanceHeaders(meta)
	})

	// stream.write(JSON.stringify( ... ))

	stream.end()
}