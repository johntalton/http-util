import http2 from 'node:http2'

import { CONTENT_TYPE_TEXT } from '../../headers/content-type.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_RETRY_AFTER
} = http2.constants

const { HTTP_STATUS_SERVICE_UNAVAILABLE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {number|undefined} retryAfter
 * @param {Metadata} meta
 */
export function sendUnavailable(stream, message, retryAfter, meta) {
	_sendUnavailable(stream, message, { retryAfter }, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {Pick<SendInfo, 'retryAfter'>} info
 * @param {Metadata} meta
 */
export function _sendUnavailable(stream, message, info, meta) {
	const { retryAfter } = info

	send(stream, HTTP_STATUS_SERVICE_UNAVAILABLE, {
		[HTTP2_HEADER_RETRY_AFTER]: Number.isInteger(retryAfter) ? `${retryAfter}` : undefined
	}, [ HTTP2_HEADER_RETRY_AFTER ], CONTENT_TYPE_TEXT, message, meta)
}
