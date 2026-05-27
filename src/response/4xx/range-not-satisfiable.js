import http2 from 'node:http2'

import { CONTENT_RANGE_UNKNOWN, ContentRange } from '../../headers/content-range.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, Metadata } from '../../defs.js' */
/** @import { ContentRangeDirective} from '../../headers/content-range.js' */

const {
	HTTP2_HEADER_CONTENT_RANGE
} = http2.constants

const { HTTP_STATUS_RANGE_NOT_SATISFIABLE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'rangeDirective'>} content
 * @param {Metadata} meta
 */
export function sendRangeNotSatisfiable(stream, content, meta) {
	const { rangeDirective } = content

	/** @type {ContentRangeDirective} */
	const invalidRange = { size: rangeDirective.size, range: CONTENT_RANGE_UNKNOWN }

	send(stream, HTTP_STATUS_RANGE_NOT_SATISFIABLE, {
		[HTTP2_HEADER_CONTENT_RANGE]: ContentRange.encode(invalidRange)
	}, [ HTTP2_HEADER_CONTENT_RANGE ], undefined, undefined, meta)
}
