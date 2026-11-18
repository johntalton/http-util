import { HTTP_STATUS_BAD_REQUEST } from '../../status.js'
import { send_no_body_or_problem } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} _message
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendBadRequest(stream, _message, context, meta) {
	send_no_body_or_problem(stream, HTTP_STATUS_BAD_REQUEST, {}, [], context, meta)
}
