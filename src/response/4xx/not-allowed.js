import { COMMON_LIST_VALUE_JOINER_COMMA } from '../../defs.js'
import { HTTP_HEADER_ALLOW } from '../../headers.js'
import { HTTP_STATUS_METHOD_NOT_ALLOWED } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendInfo, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'supportedMethods'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendNotAllowed(stream, info, context, meta) {
	const { supportedMethods } = info

	send_no_body(stream, HTTP_STATUS_METHOD_NOT_ALLOWED, {
			[HTTP_HEADER_ALLOW]: supportedMethods.join(COMMON_LIST_VALUE_JOINER_COMMA)
		}, [ HTTP_HEADER_ALLOW ], context, meta)
}
