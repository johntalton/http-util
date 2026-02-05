import http2 from 'node:http2'
import { send } from './send-util.js'
import { Conditional } from '../conditional.js'
import { CacheControl } from '../cache-control.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */
/** @import { CacheControlOptions } from '../cache-control.js' */

const {
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL
} = http2.constants

const { HTTP_STATUS_NOT_MODIFIED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {EtagItem|undefined} etag
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {Metadata} meta
 */
export function sendNotModified(stream, etag, age, cacheControl, meta) {
	send(stream, HTTP_STATUS_NOT_MODIFIED, {
			[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_AGE]: age !== undefined ? `${age}` : undefined
		}, [ HTTP2_HEADER_AGE ], undefined, undefined, meta)
}
