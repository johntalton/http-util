import { CONTENT_TYPE_TEXT } from '../../headers/content-type.js'
import { HTTP_STATUS_BAD_REQUEST } from '../../status.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendBadRequest(stream, message, context, meta) {
	// todo Assert.isString(message) if not undefined
	// todo if message is undefined used send_no_body
	send(stream, HTTP_STATUS_BAD_REQUEST, {}, [], undefined, CONTENT_TYPE_TEXT, message, context, meta)
}
