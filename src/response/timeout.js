import http2 from 'node:http2'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_REQUEST_TIMEOUT
} = http2.constants

const { HTTP2_HEADER_CONNECTION } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendTimeout(stream, meta) {
	send(stream, HTTP_STATUS_REQUEST_TIMEOUT, {
			[HTTP2_HEADER_CONNECTION]: 'close'
		}, [], undefined, undefined, meta)
}
