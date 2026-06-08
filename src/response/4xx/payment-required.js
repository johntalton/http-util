import http2 from 'node:http2'

import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const { HTTP_STATUS_PAYMENT_REQUIRED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendPaymentRequired(stream, meta) {
	send_no_body(stream, HTTP_STATUS_PAYMENT_REQUIRED, {
	}, [ ], meta)
}
