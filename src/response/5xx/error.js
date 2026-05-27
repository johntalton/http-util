import http2 from 'node:http2'

import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const { HTTP_STATUS_INTERNAL_SERVER_ERROR } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} message
 * @param {Metadata} meta
 */
export function sendError(stream, message, meta) {
	send_error(stream, HTTP_STATUS_INTERNAL_SERVER_ERROR, message, undefined, meta)
}
