import http2 from 'node:http2'
import {
	MIME_TYPE_MESSAGE_HTTP
} from '../content-type.js'
import {
	HTTP_HEADER_SERVER_TIMING,
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	ServerTiming
} from '../server-timing.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { IncomingHttpHeaders } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_SERVER
} = http2.constants

const {
	HTTP_STATUS_OK
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} method
 * @param {URL} url
 * @param {IncomingHttpHeaders} headers
 * @param {Metadata} meta
 */
export function sendTrace(stream, method, url, headers, meta) {
	const FILTER_KEYS = [ 'authorization', 'cookie' ]
	const HTTP_VERSION = new Map([
		[ 'h2', 'HTTP/2' ],
		[ 'h2c', 'HTTP/2'],
		[ 'http/1.1', 'HTTP/1.1']
	])

	const version = HTTP_VERSION.get(stream.session?.alpnProtocol ?? 'h2')

	stream.respond({
		[HTTP2_HEADER_CONTENT_TYPE]: MIME_TYPE_MESSAGE_HTTP,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_OK,
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance),
	})

	const reconstructed = [
		`${method} ${url.pathname}${url.search} ${version}`,
		Object.entries(headers)
			.filter(([ key ]) => !key.startsWith(':'))
			.filter(([ key ]) => !FILTER_KEYS.includes(key))
			.map(([ key, value ]) => `${key}: ${value}`)
			.join('\n'),
		'\n'
		]
		.join('\n')

	stream.end(reconstructed)
}

