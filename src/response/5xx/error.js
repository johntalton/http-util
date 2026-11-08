import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../../status.js'
import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} message
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendError(stream, message, context, meta) {
	send_error(stream, HTTP_STATUS_INTERNAL_SERVER_ERROR, message, undefined, context, meta)
}
