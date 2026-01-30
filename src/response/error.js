import http2 from 'node:http2'
import {
	CONTENT_TYPE_TEXT
} from '../content-type.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_SERVER
} = http2.constants

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
	console.error('500', message)

	if(stream === undefined) { return }
	if(stream.closed) { return }

	if(!stream.headersSent) {
		stream.respond({
			...coreHeaders(HTTP_STATUS_INTERNAL_SERVER_ERROR, CONTENT_TYPE_TEXT, meta),
			...performanceHeaders(meta)
		})
	}

	// protect against HEAD calls
	if(stream.writable) {
		if(message !== undefined) { stream.write(message) }
	}

	stream.end()
	if(!stream.closed) { stream.close() }
}