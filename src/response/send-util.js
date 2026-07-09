import http2 from 'node:http2'
import { compose, pipeline, Readable } from 'node:stream'
import { ReadableStream } from 'node:stream/web'
import zlib from 'node:zlib'

import { COMMON_LIST_VALUE_JOINER_COMMA, HTTP_HEADER_ACCEPT_QUERY, isNonEmptyArray } from '../defs.js'
import { CacheControl } from '../headers/cache-control.js'
import { Conditional } from '../headers/conditional.js'
import { ContentDisposition } from '../headers/content-disposition.js'
import { ContentRange } from '../headers/content-range.js'
import { CHARSET_UTF8, CONTENT_TYPE_JSON } from '../headers/content-type.js'
import {
	contextHeaders,
	coreHeaders,
	customHeaders,
	legacyHeaders,
	performanceHeaders,
	varyHeaders
} from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { OutgoingHttpHeaders } from 'node:http2' */
/** @import { InputType, BrotliOptions, ZlibOptions, ZstdOptions } from 'node:zlib' */
/** @import { AcceptRangeUnits, Metadata, SendContext, SendBody } from '../defs.js' */
/** @import { EtagItem, IMFFixDateInput } from '../headers/conditional.js' */
/** @import { CacheControlOptions } from '../headers/cache-control.js' */
/** @import { ContentRangeDirective } from '../headers/content-range.js' */
/** @import { DispositionInput } from '../headers/content-disposition.js' */

const {
	HTTP_STATUS_INTERNAL_SERVER_ERROR,
	HTTP_STATUS_NOT_FOUND,
	HTTP_STATUS_UNAUTHORIZED
} = http2.constants

const {
	HTTP2_HEADER_CONTENT_ENCODING,
	HTTP2_HEADER_CACHE_CONTROL,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED,
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ACCEPT_RANGES,
	HTTP2_HEADER_CONTENT_RANGE,
	HTTP2_HEADER_CONTENT_LENGTH,
	HTTP2_HEADER_CONTENT_DISPOSITION,
	HTTP2_HEADER_ACCEPT,
	HTTP2_HEADER_ACCEPT_ENCODING,
	HTTP2_HEADER_RETRY_AFTER
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {OutgoingHttpHeaders} headers
 * @param {Array<string>} exposedHeaders
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function send_no_body(stream, status, headers, exposedHeaders, context, meta) {
	send(stream, status, headers, exposedHeaders, undefined, undefined, undefined, context, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} message
 * @param {number|undefined} retryAfter
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function send_error(stream, status, message, retryAfter, context, meta) {
	// Assert.isString(message, 'message') if not undefined

	const obj = JSON.stringify({
		message: message ?? 'Error'
	})

	const exposedHeaders = Number.isInteger(retryAfter) ? [ HTTP2_HEADER_RETRY_AFTER ] : []
	const customVaryHeaders = undefined

	send(stream, status, {
		[HTTP2_HEADER_RETRY_AFTER]: Number.isInteger(retryAfter) ? `${retryAfter}` : undefined
	}, exposedHeaders, customVaryHeaders, CONTENT_TYPE_JSON, obj, context, meta) // todo should this be plain text
}

/** @typedef { (data: InputType) => Buffer<ArrayBuffer> } EncoderFun */

/** @type {Map<string, EncoderFun>} */
export const ENCODER_MAP = new Map([
	[ 'br', data => zlib.brotliCompressSync(data) ],
	[ 'gzip', data => zlib.gzipSync(data) ],
	[ 'deflate', data => zlib.deflateSync(data) ],
	[ 'zstd', data => zlib.zstdCompressSync(data) ]
])

/** @type {BrotliOptions} */
export const ENCODER_STREAM_BR_OPTIONS = { }

/** @type {ZlibOptions} */
export const ENCODER_STREAM_GZIP_OPTIONS = {}

/** @type {ZlibOptions} */
export const ENCODER_STREAM_DEFLATE_OPTIONS = {}

/** @type {ZstdOptions} */
export const ENCODER_STREAM_ZSTD_OPTIONS = {}

/** @typedef {(stream: Readable) => Readable} EncoderStreamFn */

/** @type {Map<string, EncoderStreamFn>} */
export const ENCODER_STREAM_MAP = new Map([
	[ 'br', stream => compose(stream, zlib.createBrotliCompress(ENCODER_STREAM_BR_OPTIONS)) ],
	[ 'gzip', stream => compose(stream, zlib.createGzip(ENCODER_STREAM_GZIP_OPTIONS)) ],
	[ 'deflate', stream => compose(stream, zlib.createDeflate(ENCODER_STREAM_DEFLATE_OPTIONS)) ],
	[ 'zstd', stream => compose(stream, zlib.createZstdCompress(ENCODER_STREAM_ZSTD_OPTIONS)) ]
])

/**
 * @template T
 * @param {string|undefined|'identity'} encoding
 * @param {Map<string, T>} listing
 * @returns {{ encoderFn: T | undefined, encoding: string | undefined }}
 */
export function lookupEncoder(encoding, listing) {
	// todo Assert.isString(encoding) if not undefined
	const encoderFn = listing.get(encoding ?? 'identity')
	if(encoderFn === undefined) {
		return {
			encoderFn: undefined,
			encoding: encoding === 'identity' ? encoding : undefined
		}
	}

	return {
		encoderFn,
		encoding
	}
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} body
 * @param {DispositionInput|undefined} contentDisposition
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions|undefined} cacheControl
 * @param {AcceptRangeUnits|undefined} acceptRanges
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function send_encoded(stream, status, contentType, body, contentDisposition, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, context, meta) {
	// Assert.isString(encoding) if not undefined
	if(body === undefined) {
		meta.performance.push({ name: 'encode', duration: 0 })
		send_bytes(stream, status, contentType, body, contentDisposition, undefined, undefined, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, context, meta)
		return
	}

	const obj = (typeof body === 'string') ? Buffer.from(body, CHARSET_UTF8) : body

	if((obj instanceof ReadableStream) || (obj instanceof Readable)) {
		const { encoderFn, encoding: actualEncoding } = lookupEncoder(encoding,	 ENCODER_STREAM_MAP)
		const encodedStream = (encoderFn === undefined) ? obj : encoderFn((obj instanceof ReadableStream) ? Readable.fromWeb(obj) : obj)
		send_bytes(stream, status, contentType, encodedStream, contentDisposition, undefined, undefined, actualEncoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, context, meta)
		return
	}

	const { encoderFn, encoding: actualEncoding } = lookupEncoder(encoding, ENCODER_MAP)
	const encodeStart = performance.now()
	const encodedData = (encoderFn === undefined) ? obj : encoderFn(obj)
	const encodeEnd = performance.now()

	meta.performance.push(
		{ name: 'encode', duration: encodeEnd - encodeStart }
	)

	send_bytes(stream, status, contentType, encodedData, contentDisposition, undefined, undefined, actualEncoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, context, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} obj
 * @param {DispositionInput|undefined} contentDisposition
 * @param {ContentRangeDirective|undefined} range
 * @param {number|undefined} contentLength
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions|undefined} cacheControl
 * @param {AcceptRangeUnits|undefined} acceptRanges
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function send_bytes(stream, status, contentType, obj, contentDisposition, range, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, context, meta) {
	// todo Assert.isString(encoding) if not undefined
	const contentLen = Number.isInteger(contentLength) ? `${contentLength}` : undefined
	const supportsQuery = isNonEmptyArray(supportedQueryTypes)

	const exposedHeaders = []
	if(age !== undefined) { exposedHeaders.push(HTTP2_HEADER_AGE) }
	if(acceptRanges !== undefined) { exposedHeaders.push(HTTP2_HEADER_ACCEPT_RANGES) }
	if(range !== undefined) { exposedHeaders.push(HTTP2_HEADER_CONTENT_RANGE) }
	if(supportsQuery) { exposedHeaders.push(HTTP_HEADER_ACCEPT_QUERY) }

	const customVaryHeaders = [ HTTP2_HEADER_ACCEPT, HTTP2_HEADER_ACCEPT_ENCODING ]
	//if(range !== undefined) { customVaryHeaders.push(HTTP2_HEADER_RANGE) } // todo: very on range is true even if not returning a content range (multipart/byteranges)
	// todo add to Vary "Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site"
	// todo add to Very "Origin"

	send(stream, status, {
			[HTTP2_HEADER_CONTENT_ENCODING]: encoding,
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified),
			[HTTP2_HEADER_AGE]: Number.isInteger(age) ? `${age}` : undefined,
			[HTTP2_HEADER_CONTENT_LENGTH]: contentLen,
			[HTTP2_HEADER_CONTENT_DISPOSITION]: ContentDisposition.encode(contentDisposition),
			[HTTP2_HEADER_CONTENT_RANGE]: ContentRange.encode(range),
			[HTTP2_HEADER_ACCEPT_RANGES]: acceptRanges,
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(COMMON_LIST_VALUE_JOINER_COMMA)
		}, exposedHeaders, customVaryHeaders, contentType, obj, context, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {number} status
 * @param {OutgoingHttpHeaders} headers
 * @param {Array<string>} exposedHeaders
 * @param {Array<string>|undefined} customVaryHeaders
 * @param {string|undefined} contentType
 * @param {SendBody|undefined} body
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function send(stream, status, headers, exposedHeaders, customVaryHeaders, contentType, body, context, meta) {
	// todo Assert.isString(contentType) if not undefined
	// if(status >= 400) { console.warn(status, body) }
	if(status === HTTP_STATUS_UNAUTHORIZED) { console.warn(status, body) }
	if(status === HTTP_STATUS_NOT_FOUND) { console.warn(status, body) }
	if(status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) { console.warn(status, body) }
	// console.log('SEND', status, body?.byteLength)

	if(stream === undefined) {
		console.log('send - end stream undef')
		return
	}

	if(stream.closed) {
		console.log('send - end closed')
		return
	}

	if(!stream.headersSent) {
		const custom = customHeaders(meta)
		const exposed = [ ...exposedHeaders, ...Object.keys(custom) ]

		const { vary: contextVaryHeaders, headers: contextValues } = contextHeaders(context)

		stream.respond({
			...legacyHeaders(false),
			...coreHeaders(status, contentType, exposed, meta),
			...contextValues,
			...varyHeaders(customVaryHeaders, contextVaryHeaders),
			...performanceHeaders(meta),
			...headers,
			...custom
		})
	}

	if(stream.writable && body !== undefined) {
		if(body instanceof ReadableStream || body instanceof Readable) {
			// todo this goes async into the void, is that good?
			pipeline(
				body,
				stream,
				err => {
					if(err !== null && err !== undefined) {
						console.warn('pipeline error', err)
						// throw new Error('pipeline error')
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
