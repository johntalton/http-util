import http2 from 'node:http2'
import { Readable } from 'node:stream'
import { ReadableStream } from 'node:stream/web'

import {
	coreHeaders,
	customHeaders,
	performanceHeaders
} from './header-util.js'
import { ContentRange } from '../content-range.js'
import { CacheControl } from '../cache-control.js'
import { Conditional } from '../conditional.js'
import { HTTP_HEADER_ACCEPT_QUERY } from './defs.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { IncomingHttpHeaders } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */
/** @import { CacheControlOptions } from '../cache-control.js' */
/** @import { ContentRangeDirective } from '../content-range.js' */

/** @typedef {ArrayBufferLike|ArrayBufferView|ReadableStream|string} SendBody */

const {
	HTTP2_HEADER_CONTENT_ENCODING,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ACCEPT_RANGES,
	HTTP2_HEADER_CONTENT_RANGE,
	HTTP2_HEADER_CONTENT_LENGTH,
	HTTP2_HEADER_ACCEPT,
	HTTP2_HEADER_ACCEPT_ENCODING,
	HTTP2_HEADER_RANGE
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} obj
 * @param {ContentRangeDirective|undefined} range
 * @param {number|undefined} contentLength
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {number|undefined} age
 * @param {CacheControlOptions|undefined} cacheControl
 * @param {'bytes'|'none'|undefined} acceptRanges
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {Metadata} meta
 */
export function send_bytes(stream, status, contentType, obj, range, contentLength, encoding, etag, age, cacheControl, acceptRanges, supportedQueryTypes, meta) {
	const contentLen = Number.isInteger(contentLength) ? `${contentLength}` : undefined
	const supportsQuery = supportedQueryTypes !== undefined && supportedQueryTypes.length > 0

	const exposedHeaders = [ ]
	if(age !== undefined) { exposedHeaders.push(HTTP2_HEADER_AGE) }
	if(acceptRanges !== undefined) { exposedHeaders.push(HTTP2_HEADER_ACCEPT_RANGES) }
	if(range !== undefined) { exposedHeaders.push(HTTP2_HEADER_CONTENT_RANGE) }
	if(supportsQuery) { exposedHeaders.push(HTTP_HEADER_ACCEPT_QUERY) }

	const varyHeaders = [ HTTP2_HEADER_ACCEPT, HTTP2_HEADER_ACCEPT_ENCODING ]
	if(range !== undefined) { varyHeaders.push(HTTP2_HEADER_RANGE) }

	send(stream, status, {
			[HTTP2_HEADER_CONTENT_ENCODING]: encoding,
			[HTTP2_HEADER_VARY]: varyHeaders.join(','),
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_AGE]: age !== undefined ? `${age}` : undefined,
			[HTTP2_HEADER_CONTENT_LENGTH]: contentLen,
			[HTTP2_HEADER_CONTENT_RANGE]: ContentRange.encode(range),
			[HTTP2_HEADER_ACCEPT_RANGES]: acceptRanges,
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(',')
		}, exposedHeaders, contentType, obj, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {IncomingHttpHeaders} headers
 * @param {Array<string>} exposedHeaders
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} body
 * @param {Metadata} meta
 */
export function send(stream, status, headers, exposedHeaders, contentType, body, meta) {
	// if(status >= 400) { console.warn(status, body) }
	if(status === 401) { console.warn(status, body) }
	if(status === 404) { console.warn(status, body) }
	if(status >= 500) { console.warn(status, body) }
	// console.log('SEND', status, body?.byteLength)

	if(stream === undefined) { console.log('send - end stream undef'); return }
	if(stream.closed) { console.log('send - end closed'); return }

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
		if(body instanceof ReadableStream) {
			Readable.fromWeb(body).pipe(stream)
			return
		}

		stream.end(body)
		return
	}

	stream.end()
	// if(!stream.closed) { stream.close() }
}