import http2 from 'node:http2'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_LOCATION
} = http2.constants

const { HTTP_STATUS_TEMPORARY_REDIRECT } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL} location
 * @param {Metadata} meta
 */
export function sendTemporaryRedirect(stream, location, meta) {
	send(stream, HTTP_STATUS_TEMPORARY_REDIRECT, {
		[HTTP2_HEADER_LOCATION]: location.href
	}, [HTTP2_HEADER_LOCATION], undefined, undefined, meta)
}
