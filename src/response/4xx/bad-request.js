import http2 from 'node:http2'

import { CONTENT_TYPE_TEXT } from '../../headers/content-type.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const { HTTP_STATUS_BAD_REQUEST } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} message
 * @param {Metadata} meta
 */
export function sendBadRequest(stream, message, meta) {
	send(stream, HTTP_STATUS_BAD_REQUEST, {}, [], CONTENT_TYPE_TEXT, message, meta)
}
