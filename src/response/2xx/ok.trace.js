import { CONTENT_TYPE_MESSAGE_HTTP } from '../../headers/content-type.js'
import { HTTP_STATUS_OK } from '../../status.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { IncomingHttpHeaders } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

const LINE_ENDING = '\n'
const PSEUDO_HEADER_PREFIX = ':'

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} method
 * @param {URL} url
 * @param {IncomingHttpHeaders} headers
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendTrace(stream, method, url, headers, context, meta) {
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
			.filter(([ key ]) => !key.startsWith(PSEUDO_HEADER_PREFIX))
			.filter(([ key ]) => !FILTER_KEYS.includes(key))
			.map(([ key, value ]) => `${key}: ${value}`)
			.join(LINE_ENDING),
		LINE_ENDING
		]
		.join(LINE_ENDING)

	send(stream, HTTP_STATUS_OK, {}, [], undefined, CONTENT_TYPE_MESSAGE_HTTP, reconstructed, context, meta)
}
