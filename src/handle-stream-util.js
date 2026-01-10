import http2 from 'node:http2'
import { brotliCompressSync, deflateSync, gzipSync, zstdCompressSync } from 'node:zlib'

import {
	SSE_MIME,
	SSE_INACTIVE_STATUS_CODE,
	SSE_BOM,
	ENDING,
} from '@johntalton/sse-util'

import { CHARSET_UTF8, CONTENT_TYPE_JSON, CONTENT_TYPE_TEXT } from './content-type.js'
import { ServerTiming, HTTP_HEADER_SERVER_TIMING, HTTP_HEADER_TIMING_ALLOW_ORIGIN } from './server-timing.js'
import { HTTP_HEADER_RATE_LIMIT, HTTP_HEADER_RATE_LIMIT_POLICY, RateLimit, RateLimitPolicy } from './rate-limit.js'

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_CONTENT_ENCODING,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_RETRY_AFTER,
	HTTP2_HEADER_CACHE_CONTROL
} = http2.constants

const {
	HTTP_STATUS_OK,
	HTTP_STATUS_NOT_FOUND,
	HTTP_STATUS_UNAUTHORIZED,
	HTTP_STATUS_NO_CONTENT,
	HTTP_STATUS_INTERNAL_SERVER_ERROR,
	HTTP_STATUS_TOO_MANY_REQUESTS
} = http2.constants

export const HTTP_HEADER_ORIGIN = 'origin'
export const HTTP_HEADER_USER_AGENT = 'user-agent'
export const HTTP_HEADER_FORWARDED = 'forwarded'
export const HTTP_HEADER_SEC_CH_UA = 'sec-ch-ua'
export const HTTP_HEADER_SEC_CH_PLATFORM = 'sec-ch-ua-platform'
export const HTTP_HEADER_SEC_CH_MOBILE = 'sec-ch-ua-mobile'
export const HTTP_HEADER_SEC_FETCH_SITE = 'sec-fetch-site'
export const HTTP_HEADER_SEC_FETCH_MODE = 'sec-fetch-mode'
export const HTTP_HEADER_SEC_FETCH_DEST = 'sec-fetch-dest'

export const DEFAULT_METHODS = [ 'HEAD', 'GET', 'POST', 'PATCH', 'DELETE' ]

export const HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE = 'access-control-max-age'
export const PREFLIGHT_AGE_SECONDS = '500'

/**
 * @import { ServerHttp2Stream } from 'node:http2'
 */

/**
 * @import { TimingsInfo } from './server-timing.js'
 */

/**
 * @typedef {Object} Metadata
 * @property {Array<TimingsInfo>} performance
 * @property {string|undefined} servername
 * @property {string|undefined} origin
 */

/**
 * @typedef {Object} SSEOptions
 * @property {boolean} [active]
 * @property {boolean} [bom]
 */

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
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
			[HTTP2_HEADER_STATUS]: HTTP_STATUS_INTERNAL_SERVER_ERROR,
			[HTTP2_HEADER_CONTENT_TYPE]: CONTENT_TYPE_TEXT,
			[HTTP2_HEADER_SERVER]: meta.servername
		})
	}

	// protect against HEAD calls
	if(stream.writable) {
		if(message !== undefined) { stream.write(message) }
	}

	stream.end()
	if(!stream.closed) { stream.close() }
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} allowedOrigin
 * @param {Array<string>} methods
 * @param {Metadata} meta
 */
export function sendPreflight(stream, allowedOrigin, methods, meta) {
	stream.respond({
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_OK,
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: allowedOrigin,
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS]: methods.join(','),
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS]: ['Authorization', HTTP2_HEADER_CONTENT_TYPE].join(','),
		[HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE]: PREFLIGHT_AGE_SECONDS,
		[HTTP2_HEADER_SERVER]: meta.servername
	})
	stream.end()
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendUnauthorized(stream, meta) {
	console.log('Unauthorized')

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_UNAUTHORIZED,
		[HTTP2_HEADER_SERVER]: meta.servername
	})
	stream.end()
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {string} message
 * @param {Metadata} meta
 */
export function sendNotFound(stream, message, meta) {
	console.log('404', message)
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_NOT_FOUND,
		[HTTP2_HEADER_CONTENT_TYPE]: CONTENT_TYPE_TEXT,
		[HTTP2_HEADER_SERVER]: meta.servername
	})

	if(message !== undefined) { stream.write(message) }
	stream.end()
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {*} limitInfo
 * @param {Array<any>} policies
 * @param {Metadata} meta
 */
export function sendTooManyRequests(stream, limitInfo, policies, meta) {
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_TOO_MANY_REQUESTS,
		[HTTP2_HEADER_SERVER]: meta.servername,

		[HTTP2_HEADER_RETRY_AFTER]: limitInfo.retryAfterS,
		[HTTP_HEADER_RATE_LIMIT]: RateLimit.from(limitInfo),
		[HTTP_HEADER_RATE_LIMIT_POLICY]: RateLimitPolicy.from(...policies)
	})

	stream.write(`Retry After ${limitInfo.retryAfterS} Seconds`)
	stream.end()
}

/**
 * @typedef { (data: string, charset: BufferEncoding) => Buffer } EncoderFun
 */

/** @type {Map<string, EncoderFun>} */
export const ENCODER_MAP = new Map([
	[ 'br', (data, charset) => brotliCompressSync(Buffer.from(data, charset)) ],
	[ 'gzip', (data, charset) => gzipSync(Buffer.from(data, charset)) ],
	[ 'deflate', (data, charset) => deflateSync(Buffer.from(data, charset)) ],
	[ 'zstd', (data, charset) => zstdCompressSync(Buffer.from(data, charset)) ]
])

/**
 * @param {ServerHttp2Stream} stream
 * @param {Object} obj
 * @param {string|undefined} encoding
 * @param {string|undefined} allowedOrigin
 * @param {Metadata} meta
 */
export function sendJSON_Encoded(stream, obj, encoding, allowedOrigin, meta) {
	if(stream.closed) { return }

	const json = JSON.stringify(obj)

	const useIdentity = encoding === 'identity'
	const encoder = encoding !== undefined ? ENCODER_MAP.get(encoding) : undefined
	const hasEncoder = encoder !== undefined
	const actualEncoding = hasEncoder ? encoding : undefined

	const encodeStart = performance.now()
	const encodedData = hasEncoder && !useIdentity ? encoder(json, CHARSET_UTF8) : json
	const encodeEnd = performance.now()

	meta.performance.push(
		{ name: 'encode', duration: encodeEnd - encodeStart }
	)

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: allowedOrigin,
		[HTTP2_HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
		[HTTP2_HEADER_CONTENT_ENCODING]: actualEncoding,
		[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
		[HTTP2_HEADER_CACHE_CONTROL]: 'private',
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_OK,
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: allowedOrigin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance)
	})

	// stream.write(encodedData)
	stream.end(encodedData)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} allowedOrigin
 * @param {SSEOptions & Metadata} meta
 */
export function sendSSE(stream, allowedOrigin, meta) {
	// stream.setTimeout(0)
	// stream.session?.setTimeout(0)
	// stream.session?.socket.setTimeout(0)
	// stream.session.socket.setNoDelay(true)
	// stream.session.socket.setKeepAlive(true)

	// stream.on('close', () => console.log('SSE stream closed'))
	// stream.on('aborted', () => console.log('SSE stream aborted'))

	const activeStream = meta.active ?? true
	const sendBOM = meta.bom ?? true

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: allowedOrigin,
		[HTTP2_HEADER_CONTENT_TYPE]: SSE_MIME,
		[HTTP2_HEADER_STATUS]: activeStream ? HTTP_STATUS_OK : HTTP_STATUS_NO_CONTENT, // SSE_INACTIVE_STATUS_CODE
		// [HTTP2_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS]: 'true'
		[HTTP2_HEADER_SERVER]: meta.servername
	 })

	 if(!activeStream) {
		stream.end()
		return
	 }

	if(sendBOM) {
		stream.write(SSE_BOM + ENDING.CRLF)
	}
}
