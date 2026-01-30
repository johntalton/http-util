import http2 from 'node:http2'
import {
	CONTENT_TYPE_TEXT
} from '../content-type.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_SERVER
} = http2.constants

const {
	HTTP_STATUS_NOT_FOUND
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} message
 * @param {Metadata} meta
 */
export function sendNotFound(stream, message, meta) {
	console.log('404', message)

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_NOT_FOUND,
		[HTTP2_HEADER_CONTENT_TYPE]: CONTENT_TYPE_TEXT,
		[HTTP2_HEADER_SERVER]: meta.servername
	})

	if(message !== undefined) { stream.write(message) }
	stream.end()
}
