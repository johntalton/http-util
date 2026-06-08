import http2 from 'node:http2'

import {
	COMMON_LIST_VALUE_JOINER_COMMA,
	HTTP_HEADER_ACCEPT_PATCH,
	HTTP_HEADER_ACCEPT_POST,
	HTTP_HEADER_ACCEPT_QUERY
} from '../../defs.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, Metadata } from '../../defs.js' */

const { HTTP2_METHOD_POST, HTTP2_METHOD_PATCH } = http2.constants

const { HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'acceptableMediaType' | 'supportedQueryTypes'>} info
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, info, meta) {
	const {
		supportedQueryTypes,
		acceptableMediaType
	} = info

	const method = HTTP2_METHOD_POST // todo pass in as parameter or split acceptable to post and patch types
	const acceptable = Array.isArray(acceptableMediaType) ? acceptableMediaType : [ acceptableMediaType ] // todo undefined creates array of one item
	const acceptHeader = (method === HTTP2_METHOD_POST) ? HTTP_HEADER_ACCEPT_POST : HTTP_HEADER_ACCEPT_PATCH
	const acceptValue = ((method === HTTP2_METHOD_POST) || (method === HTTP2_METHOD_PATCH)) ? acceptable.join(COMMON_LIST_VALUE_JOINER_COMMA) : undefined

	const supportsQuery = supportedQueryTypes !== undefined && supportedQueryTypes.length > 0
	const exposedHeaders = supportsQuery ? [ HTTP_HEADER_ACCEPT_QUERY, acceptHeader ] : [ acceptHeader ]


	send_no_body(stream, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE, {
			[acceptHeader]: acceptValue,
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(COMMON_LIST_VALUE_JOINER_COMMA)
		}, exposedHeaders, meta)
}
