import { CacheControl } from '../../headers/cache-control.js'
import { Conditional } from '../../headers/conditional.js'
import { InternetMessageFormatFixDate } from '../../headers/util/imf-fixdate.js'
import {
	HTTP_HEADER_ACCEPT,
	HTTP_HEADER_ACCEPT_ENCODING,
	HTTP_HEADER_AGE,
	HTTP_HEADER_CACHE_CONTROL,
	HTTP_HEADER_ETAG,
	HTTP_HEADER_LAST_MODIFIED,
} from '../../headers.js'
import { HTTP_STATUS_NOT_MODIFIED } from '../../status.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendContext, Metadata } from '../../defs.js' */

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

	const customVaryHeaders = [ HTTP_HEADER_ACCEPT, HTTP_HEADER_ACCEPT_ENCODING ]

	// todo Content-Type would have been in valid send
	// todo this matches send-utl send_bytes - normalize
	send(stream, HTTP_STATUS_NOT_MODIFIED, {
			// todo Content-Location
			[HTTP_HEADER_CACHE_CONTROL]: CacheControl.encode(cacheControl),
			[HTTP_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP_HEADER_LAST_MODIFIED]: InternetMessageFormatFixDate.encode(lastModified),
			[HTTP_HEADER_AGE]: Number.isInteger(age) ? `${age}` : undefined
			// content-range
			// accept-range
			// accept-query
		}, [ HTTP_HEADER_AGE ], customVaryHeaders, undefined, undefined, context, meta)
}
