import { Conditional } from '../../headers/conditional.js'
import { InternetMessageFormatFixDate } from '../../headers/util/imf-fixdate.js'
import {
	HTTP_HEADER_ETAG,
	HTTP_HEADER_LAST_MODIFIED,
	HTTP_HEADER_LOCATION,
} from '../../headers.js'
import { HTTP_STATUS_CREATED } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendContext, Metadata } from '../../defs.js' */

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
			[HTTP_HEADER_LOCATION]: loc,
			[HTTP_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP_HEADER_LAST_MODIFIED]: InternetMessageFormatFixDate.encode(lastModified)
		}, [ HTTP_HEADER_LOCATION ], context, meta)
}
