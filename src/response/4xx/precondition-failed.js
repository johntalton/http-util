import { Conditional } from '../../headers/conditional.js'
import { InternetMessageFormatFixDate } from '../../headers/util/imf-fixdate.js'
import {
	HTTP_HEADER_ETAG,
	HTTP_HEADER_LAST_MODIFIED
} from '../../headers.js'
import { HTTP_STATUS_PRECONDITION_FAILED } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendContent, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'etag' | 'lastModified'>} content
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendPreconditionFailed(stream, content, context, meta) {
	const {
		etag,
		lastModified
	} = content

	send_no_body(stream, HTTP_STATUS_PRECONDITION_FAILED, {
		[HTTP_HEADER_ETAG]: Conditional.encodeEtag(etag),
		[HTTP_HEADER_LAST_MODIFIED]: InternetMessageFormatFixDate.encode(lastModified)
	}, [], context, meta)
}
