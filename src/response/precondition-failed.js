import http2 from 'node:http2'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_PRECONDITION_FAILED
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendPreconditionFailed(stream, meta) {
	stream.respond({
		...coreHeaders(HTTP_STATUS_PRECONDITION_FAILED, undefined, meta),
		...performanceHeaders(meta)
	})
	stream.end()
}