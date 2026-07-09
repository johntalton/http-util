import http2 from 'node:http2'

import { CacheControl } from '../../headers/cache-control.js'
import { Conditional } from '../../headers/conditional.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendContext, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_AGE,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED,
	HTTP2_HEADER_CACHE_CONTROL,
	HTTP2_HEADER_ACCEPT,
	HTTP2_HEADER_ACCEPT_ENCODING
} = http2.constants

const { HTTP_STATUS_NOT_MODIFIED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'etag' | 'lastModified' | 'age' | 'cacheControl'>} content
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendNotModified(stream, content, context, meta) {
	const {
		etag,
		lastModified,
		age,
		cacheControl
	} = content

	const customVaryHeaders = [ HTTP2_HEADER_ACCEPT, HTTP2_HEADER_ACCEPT_ENCODING ]

	// todo Content-Type would have been in valid send
	// todo this matches send-utl send_bytes - normalize
	send(stream, HTTP_STATUS_NOT_MODIFIED, {
			// todo Content-Location
			[HTTP2_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified),
			[HTTP2_HEADER_AGE]: Number.isInteger(age) ? `${age}` : undefined
			// content-range
			// accept-range
			// accept-query
		}, [ HTTP2_HEADER_AGE ], customVaryHeaders, undefined, undefined, context, meta)
}
