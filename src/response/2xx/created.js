import http2 from 'node:http2'

import { Conditional } from '../../headers/conditional.js'
import { InternetMessageFormatFixDate } from '../../headers/util/imf-fixdate.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendContext, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_LOCATION,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED
} = http2.constants

const { HTTP_STATUS_CREATED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL|string|undefined} location
 * @param {Pick<SendContent, 'etag' | 'lastModified'>} content
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendCreated(stream, location, content, context, meta) {
	const {
		etag,
		lastModified
	} = content

	const loc = (location instanceof URL) ? location.href : location
	// todo Assert.isString(loc) if not undefined

	send_no_body(stream, HTTP_STATUS_CREATED, {
			[HTTP2_HEADER_LOCATION]: loc,
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: InternetMessageFormatFixDate.encode(lastModified)
		}, [ HTTP2_HEADER_LOCATION ], context, meta)
}
