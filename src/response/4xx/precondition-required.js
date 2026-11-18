import { HTTP_STATUS_PRECONDITION_REQUIRED } from '../../status.js'
import { send_no_body_or_problem } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendPreconditionRequired(stream, context, meta) {
	send_no_body_or_problem(stream, HTTP_STATUS_PRECONDITION_REQUIRED, {}, [], context, meta)
}
