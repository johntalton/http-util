import { CONTENT_TYPE_TEXT } from '../../headers/content-type.js'
import { HTTP_STATUS_NOT_FOUND } from '../../status.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendNotFound(stream, message, context, meta) {
	// todo Assert.isString(message) if not undefined
	// todo if message is undefined used send_no_body
	send(stream, HTTP_STATUS_NOT_FOUND, {}, [], undefined, CONTENT_TYPE_TEXT, message, context, meta)
}
