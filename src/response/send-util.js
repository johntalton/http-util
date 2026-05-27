import http2 from 'node:http2'
import { pipeline, Readable } from 'node:stream'
import { ReadableStream } from 'node:stream/web'
import {
	brotliCompressSync,
	deflateSync,
	gzipSync,
	zstdCompressSync
} from 'node:zlib'

import { HTTP_HEADER_ACCEPT_QUERY } from '../defs.js'
import { CacheControl } from '../headers/cache-control.js'
import { Conditional } from '../headers/conditional.js'
import { ContentRange } from '../headers/content-range.js'
import { CHARSET_UTF8, CONTENT_TYPE_JSON } from '../headers/content-type.js'
import {
	coreHeaders,
	customHeaders,
	performanceHeaders
} from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { OutgoingHttpHeaders } from 'node:http2' */
/** @import { InputType } from 'node:zlib' */
/** @import { AcceptRangeUnits, Metadata, SendBody } from '../defs.js' */
/** @import { EtagItem, IMFFixDateInput } from '../headers/conditional.js' */
/** @import { CacheControlOptions } from '../headers/cache-control.js' */
/** @import { ContentRangeDirective } from '../headers/content-range.js' */

const {
	HTTP_STATUS_INTERNAL_SERVER_ERROR,
	HTTP_STATUS_NOT_FOUND,
	HTTP_STATUS_UNAUTHORIZED
} = http2.constants

const {
	HTTP2_HEADER_CONTENT_ENCODING,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED,
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ACCEPT_RANGES,
	HTTP2_HEADER_CONTENT_RANGE,
	HTTP2_HEADER_CONTENT_LENGTH,
	HTTP2_HEADER_ACCEPT,
	HTTP2_HEADER_ACCEPT_ENCODING,
	HTTP2_HEADER_RANGE,
	HTTP2_HEADER_RETRY_AFTER
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} message
 * @param {number|undefined} retryAfter
 * @param {Metadata} meta
 */
export function send_error(stream, status, message, retryAfter, meta) {
	const obj = JSON.stringify({
		message: message ?? 'Error'
	})

	const exposedHeaders = Number.isInteger(retryAfter) ? [ HTTP2_HEADER_RETRY_AFTER ] : []

	send(stream, status, {
		[HTTP2_HEADER_RETRY_AFTER]: Number.isInteger(retryAfter) ? `${retryAfter}` : undefined
	}, exposedHeaders, CONTENT_TYPE_JSON, obj, meta) // todo should this be plain text
}

/** @typedef { (data: InputType) => Buffer<ArrayBuffer> } EncoderFun */

/** @type {Map<string, EncoderFun>} */
export const ENCODER_MAP = new Map([
	[ 'br', data => brotliCompressSync(data) ],
	[ 'gzip', data => gzipSync(data) ],
	[ 'deflate', data => deflateSync(data) ],
	[ 'zstd', data => zstdCompressSync(data) ]
])

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {SendBody} body
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions|undefined} cacheControl
 * @param {AcceptRangeUnits|undefined} acceptRanges
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {Metadata} meta
 */
export function send_encoded(stream, status, contentType, body, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, meta) {
	const obj = (typeof body === 'string') ? Buffer.from(body, CHARSET_UTF8) : body

	const useIdentity = encoding === 'identity'
	const encoder = encoding === undefined ? undefined : ENCODER_MAP.get(encoding)
	const hasEncoder = encoder !== undefined
	const actualEncoding = hasEncoder ? encoding : undefined

	const encodeStart = performance.now()
	const encodedData = (hasEncoder && !useIdentity) ? encoder(obj) : obj
	const encodeEnd = performance.now()

	meta.performance.push(
		{ name: 'encode', duration: encodeEnd - encodeStart }
	)

	send_bytes(stream, status, contentType, encodedData, undefined, undefined, actualEncoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, meta )
}


/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} obj
 * @param {ContentRangeDirective|undefined} range
 * @param {number|undefined} contentLength
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions|undefined} cacheControl
 * @param {AcceptRangeUnits|undefined} acceptRanges
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {Metadata} meta
 */
export function send_bytes(stream, status, contentType, obj, range, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, meta) {
	const contentLen = Number.isInteger(contentLength) ? `${contentLength}` : undefined
	const supportsQuery = supportedQueryTypes !== undefined && supportedQueryTypes.length > 0

	const exposedHeaders = [ ]
	if(age !== undefined) { exposedHeaders.push(HTTP2_HEADER_AGE) }
	if(acceptRanges !== undefined) { exposedHeaders.push(HTTP2_HEADER_ACCEPT_RANGES) }
	if(range !== undefined) { exposedHeaders.push(HTTP2_HEADER_CONTENT_RANGE) }
	if(supportsQuery) { exposedHeaders.push(HTTP_HEADER_ACCEPT_QUERY) }

	const varyHeaders = [ HTTP2_HEADER_ACCEPT, HTTP2_HEADER_ACCEPT_ENCODING ]
	if(range !== undefined) { varyHeaders.push(HTTP2_HEADER_RANGE) } // todo: very on range is true even if not returning a content range (multipart/byteranges)

	send(stream, status, {
			[HTTP2_HEADER_CONTENT_ENCODING]: encoding,
			[HTTP2_HEADER_VARY]: varyHeaders.join(','),
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified),
			[HTTP2_HEADER_AGE]: age === undefined ? undefined : `${age}`,
			[HTTP2_HEADER_CONTENT_LENGTH]: contentLen,
			[HTTP2_HEADER_CONTENT_RANGE]: ContentRange.encode(range),
			[HTTP2_HEADER_ACCEPT_RANGES]: acceptRanges,
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(',')
		}, exposedHeaders, contentType, obj, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {OutgoingHttpHeaders} headers
 * @param {Array<string>} exposedHeaders
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} body
 * @param {Metadata} meta
 */
export function send(stream, status, headers, exposedHeaders, contentType, body, meta) {
	// if(status >= 400) { console.warn(status, body) }
	if(status === HTTP_STATUS_UNAUTHORIZED) { console.warn(status, body) }
	if(status === HTTP_STATUS_NOT_FOUND) { console.warn(status, body) }
	if(status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) { console.warn(status, body) }
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
			const signal = undefined // AbortSignal.timeout(1000)
			pipeline(
				Readable.fromWeb(body, { signal }),
				stream,
				err => {
					if(err !== null) {
						console.warn('pipeline error')
					}
				})

			return
		}

		stream.end(body)
		return
	}

	stream.end()
	// if(!stream.closed) { stream.close() }
}