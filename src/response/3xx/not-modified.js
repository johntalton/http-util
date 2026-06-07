import http2 from 'node:http2'

import { COMMON_LIST_VALUE_JOINER_COMMA } from '../../defs.js'

import { CacheControl } from '../../headers/cache-control.js'
import { Conditional } from '../../headers/conditional.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED,
	HTTP2_HEADER_VARY,
	HTTP2_HEADER_CACHE_CONTROL,
	HTTP2_HEADER_ACCEPT,
	HTTP2_HEADER_ACCEPT_ENCODING
} = http2.constants

const { HTTP_STATUS_NOT_MODIFIED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'etag' | 'lastModified' | 'age' | 'cacheControl'>} content
 * @param {Metadata} meta
 */
export function sendNotModified(stream, content, meta) {
	const {
		etag,
		lastModified,
		age,
		cacheControl
	} = content

	const varyHeaders = [ HTTP2_HEADER_ACCEPT, HTTP2_HEADER_ACCEPT_ENCODING ]

	send(stream, HTTP_STATUS_NOT_MODIFIED, {
			// todo Content-Location
			[HTTP2_HEADER_VARY]: varyHeaders.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified),
			[HTTP2_HEADER_AGE]: Number.isInteger(age) ? `${age}` : undefined
		}, [ HTTP2_HEADER_AGE ], undefined, undefined, meta)
}
