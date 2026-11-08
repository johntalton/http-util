import { HTTP_HEADER_CONNECTION } from '../../headers.js'
import { HTTP_STATUS_REQUEST_TIMEOUT } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendTimeout(stream, context, meta) {
	send_no_body(stream, HTTP_STATUS_REQUEST_TIMEOUT, {
			[HTTP_HEADER_CONNECTION]: 'close'
		}, [], context, meta)
}
