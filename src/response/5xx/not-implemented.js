import { HTTP_STATUS_NOT_IMPLEMENTED } from '../../status.js'
import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext ,Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} _message
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendNotImplemented(stream, _message, context, meta) {
	send_error(stream, HTTP_STATUS_NOT_IMPLEMENTED, _message, undefined, context, meta)
}
