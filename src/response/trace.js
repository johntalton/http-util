import http2 from 'node:http2'
import {
	MIME_TYPE_MESSAGE_HTTP
} from '../content-type.js'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { IncomingHttpHeaders } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

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

	send(stream, HTTP_STATUS_OK, {}, MIME_TYPE_MESSAGE_HTTP, reconstructed, meta)
}

