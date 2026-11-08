import { HTTP_STATUS_INSUFFICIENT_STORAGE } from '../../status.js'
import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendInsufficientStorage(stream, context, meta) {
	send_error(stream, HTTP_STATUS_INSUFFICIENT_STORAGE, 'Insufficient Storage', undefined, context, meta)
}
