import { COMMON_LIST_VALUE_JOINER_COMMA } from '../../defs.js'
import {
	HTTP_HEADER_ACCEPT_PATCH,
	HTTP_HEADER_ACCEPT_POST,
	HTTP_HEADER_ACCEPT_QUERY
} from '../../headers.js'
import { HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE } from '../../status.js'
import { coerceSupportedTypes } from '../header-util.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendInfo, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} method
 * @param {Pick<SendInfo, 'supportedTypes' | 'supportedQueryTypes'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, method, info, context, meta) {
	const {
		supportedQueryTypes,
		supportedTypes,
	} = info

	const supportedTypesRecord = coerceSupportedTypes(method, supportedTypes)

	const exposedHeaders = []
	if(supportedQueryTypes !== undefined) { exposedHeaders.push(HTTP_HEADER_ACCEPT_QUERY) }
	// if(supportedTypesRecord.put) { exposedHeaders.push(HTTP_HEADER_ACCEPT_PUT) }
	if(supportedTypesRecord.post) { exposedHeaders.push(HTTP_HEADER_ACCEPT_POST) }
	if(supportedTypesRecord.patch) { exposedHeaders.push(HTTP_HEADER_ACCEPT_PATCH) }

	send_no_body(stream, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE, {
		// [HTTP_HEADER_ACCEPT_PUT]: supportedTypesRecord.put?.join(COMMON_LIST_VALUE_JOINER_COMMA)
			[HTTP_HEADER_ACCEPT_POST]: supportedTypesRecord.post?.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP_HEADER_ACCEPT_PATCH]: supportedTypesRecord.patch?.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(COMMON_LIST_VALUE_JOINER_COMMA)
		}, exposedHeaders, context, meta)
}
