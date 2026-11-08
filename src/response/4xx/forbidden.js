import { HTTP_STATUS_FORBIDDEN } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendForbidden(stream, context, meta) {
	send_no_body(stream, HTTP_STATUS_FORBIDDEN, {
	}, [], context, meta)
}
