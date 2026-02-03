import http2 from 'node:http2'
import {
	brotliCompressSync,
	deflateSync,
	gzipSync,
	zstdCompressSync
} from 'node:zlib'
import {
	CHARSET_UTF8,
	CONTENT_TYPE_JSON
} from '../content-type.js'
import { send } from './send-util.js'
import { Conditional } from '../conditional.js'
import { CacheControl } from '../cache-control.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */
/** @import { CacheControlOptions } from '../cache-control.js' */

/** @typedef { (data: string, charset: BufferEncoding) => Buffer } EncoderFun */

const {
  HTTP2_HEADER_CONTENT_ENCODING,
  HTTP2_HEADER_VARY,
  HTTP2_HEADER_CACHE_CONTROL,
  HTTP2_HEADER_ETAG,
	HTTP2_HEADER_AGE
} = http2.constants

const { HTTP_STATUS_OK } = http2.constants

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
 * @param {EtagItem|undefined} etag
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {Metadata} meta
 */
export function sendJSON_Encoded(stream, obj, encoding, etag, age, cacheControl, meta) {
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

	send(stream, HTTP_STATUS_OK, {
			[HTTP2_HEADER_CONTENT_ENCODING]: actualEncoding,
			[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_AGE]: age !== undefined ? `${age}` : undefined
		}, CONTENT_TYPE_JSON, encodedData, meta)
}
