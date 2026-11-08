import { CONTENT_RANGE_UNKNOWN, ContentRange } from '../../headers/content-range.js'
import { HTTP_HEADER_CONTENT_RANGE } from '../../headers.js'
import { HTTP_STATUS_RANGE_NOT_SATISFIABLE } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendContent, Metadata } from '../../defs.js' */
/** @import { ContentRangeDirective} from '../../headers/content-range.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'rangeDirective'>} content
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendRangeNotSatisfiable(stream, content, context, meta) {
	const { rangeDirective } = content

	/** @type {ContentRangeDirective} */
	const invalidRange = { size: rangeDirective.size, range: CONTENT_RANGE_UNKNOWN }

	send_no_body(stream, HTTP_STATUS_RANGE_NOT_SATISFIABLE, {
		[HTTP_HEADER_CONTENT_RANGE]: ContentRange.encode(invalidRange)
	}, [ HTTP_HEADER_CONTENT_RANGE ], context, meta)
}
