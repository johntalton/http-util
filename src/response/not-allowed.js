import http2 from 'node:http2'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_ALLOW
} = http2.constants

const {
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>} methods
 * @param {Metadata} meta
 */
export function sendNotAllowed(stream, methods, meta) {
	send(stream, HTTP_STATUS_METHOD_NOT_ALLOWED, {
			[HTTP2_HEADER_ALLOW]: methods.join(',')
		}, undefined, undefined, meta)
}