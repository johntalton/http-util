import {
	coreHeaders,
	customHeaders,
	performanceHeaders
} from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { IncomingHttpHeaders } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {IncomingHttpHeaders} headers
 * @param {Array<string>} exposedHeaders
 * @param {string|undefined} contentType
 * @param {ArrayBufferLike|ArrayBufferView|string|undefined} body
 * @param {Metadata} meta
 */
export function send(stream, status, headers, exposedHeaders, contentType, body, meta) {
	// if(status >= 400) { console.warn(status, body) }
	if(status === 401) { console.warn(status, body) }
	if(status === 404) { console.warn(status, body) }
	if(status >= 500) { console.warn(status, body) }

	if(stream === undefined) { return }
	if(stream.closed) { return }

	if(!stream.headersSent) {
		const custom = customHeaders(meta)
		const exposed = [ ...exposedHeaders, ...Object.keys(custom) ]

		stream.respond({
			...coreHeaders(status, contentType, exposed, meta),
			...performanceHeaders(meta),
			...headers,
			...custom
		})
	}

	if(stream.writable && body !== undefined) {
		stream.end(body)
		return
	}

	stream.end()
	// if(!stream.closed) { stream.close() }
}