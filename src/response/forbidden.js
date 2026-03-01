import http2 from 'node:http2'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const { HTTP_STATUS_FORBIDDEN} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendForbidden(stream, meta) {
	send(stream, HTTP_STATUS_FORBIDDEN, {
	}, [], undefined, undefined, meta)
}
