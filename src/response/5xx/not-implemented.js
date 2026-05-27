import http2 from 'node:http2'

import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const { HTTP_STATUS_NOT_IMPLEMENTED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {Metadata} meta
 */
export function sendNotImplemented(stream, message, meta) {
	send_error(stream, HTTP_STATUS_NOT_IMPLEMENTED, message, undefined, meta)
}
