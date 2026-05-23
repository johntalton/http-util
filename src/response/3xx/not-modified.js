import http2 from 'node:http2'

import { CacheControl } from '../../headers/cache-control.js'
import { Conditional } from '../../headers/conditional.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, Metadata } from '../../defs.js' */
/** @import { EtagItem, IMFFixDateInput } from '../../headers/conditional.js' */
/** @import { CacheControlOptions } from '../../headers/cache-control.js' */

const {
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL
} = http2.constants

const { HTTP_STATUS_NOT_MODIFIED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {Metadata} meta
 */
export function sendNotModified(stream, etag, lastModified, age, cacheControl, meta) {
	_sendNotModified(stream, {
		etag,
		lastModified,
		age,
		cacheControl
	}, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'etag' | 'lastModified' | 'age' | 'cacheControl'>} content
 * @param {Metadata} meta
 */
export function _sendNotModified(stream, content, meta) {
	const {
		etag,
		lastModified,
		age,
		cacheControl
	} = content

	send(stream, HTTP_STATUS_NOT_MODIFIED, {
			[HTTP2_HEADER_VARY]: 'Accept, Accept-Encoding',
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified),
			[HTTP2_HEADER_AGE]: age === undefined ? undefined : `${age}`
		}, [ HTTP2_HEADER_AGE ], undefined, undefined, meta)
}
