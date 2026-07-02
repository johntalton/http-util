import http2 from 'node:http2'

import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendInfo, Metadata } from '../../defs.js' */

const { HTTP_STATUS_SERVICE_UNAVAILABLE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {Pick<SendInfo, 'retryAfter'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendUnavailable(stream, message, info, context, meta) {
	const { retryAfter } = info

	send_error(stream, HTTP_STATUS_SERVICE_UNAVAILABLE, message, retryAfter, context, meta)
}
