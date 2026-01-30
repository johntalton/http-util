import http2 from 'node:http2'
import { brotliCompressSync, deflateSync, gzipSync, zstdCompressSync } from 'node:zlib'
import {
	CHARSET_UTF8,
	CONTENT_TYPE_JSON
} from '../content-type.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

/** @typedef { (data: string, charset: BufferEncoding) => Buffer } EncoderFun */

const {
  HTTP2_HEADER_CONTENT_ENCODING,
  HTTP2_HEADER_VARY,
  HTTP2_HEADER_CACHE_CONTROL,
  HTTP2_HEADER_ETAG
} = http2.constants

const {
  HTTP_STATUS_OK
} = http2.constants

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
 * @param {Metadata} meta
 */
export function sendJSON_Encoded(stream, obj, encoding, meta) {
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
		...coreHeaders(HTTP_STATUS_OK, CONTENT_TYPE_JSON, meta),
		...performanceHeaders(meta),

		[HTTP2_HEADER_CONTENT_ENCODING]: actualEncoding,
		[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
		[HTTP2_HEADER_CACHE_CONTROL]: 'private',
		[HTTP2_HEADER_ETAG]: `"${meta.etag}"`
		// [HTTP2_HEADER_AGE]: age
	})

	// stream.write(encodedData)
	stream.end(encodedData)
}

