import http2 from 'node:http2'
import {
	CONTENT_TYPE_TEXT
} from '../content-type.js'
import { send } from './send-util.js'

const {
	HTTP_STATUS_INTERNAL_SERVER_ERROR
} = http2.constants

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} message
 * @param {Metadata} meta
 */
export function sendError(stream, message, meta) {
	send(stream, HTTP_STATUS_INTERNAL_SERVER_ERROR, {}, CONTENT_TYPE_TEXT, message, meta)
}