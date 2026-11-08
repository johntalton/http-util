import { HTTP_STATUS_CONFLICT } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendConflict(stream, context, meta) {
	send_no_body(stream, HTTP_STATUS_CONFLICT, {}, [], context, meta)
}
