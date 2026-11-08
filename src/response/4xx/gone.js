import { HTTP_STATUS_GONE } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendGone(stream, context, meta) {
	send_no_body(stream, HTTP_STATUS_GONE, {}, [], context, meta)
}
