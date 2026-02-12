import http2 from 'node:http2'
import { send_bytes } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */
/** @import { CacheControlOptions } from '../cache-control.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {ArrayBufferLike|ArrayBufferView|undefined} obj
 * @param {string|undefined} contentType
 * @param {number|undefined} contentLength
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {'bytes'|'none'|undefined} acceptRanges
 * @param {Metadata} meta
 */
export function sendBytes(stream, contentType, obj, contentLength, encoding, etag, age, cacheControl, acceptRanges, meta) {
	send_bytes(stream, HTTP_STATUS_OK, contentType, obj, undefined, contentLength, encoding, etag, age, cacheControl, acceptRanges, undefined, meta)
}
