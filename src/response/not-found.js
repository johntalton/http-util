import http2 from 'node:http2'
import {
	CONTENT_TYPE_TEXT
} from '../content-type.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

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
		...coreHeaders(HTTP_STATUS_NOT_FOUND, CONTENT_TYPE_TEXT, meta),
		...performanceHeaders(meta)
	})

	if(message !== undefined) { stream.write(message) }
	stream.end()
}
