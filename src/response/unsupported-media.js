import http2 from 'node:http2'

import { HTTP_HEADER_ACCEPT_PATCH, HTTP_HEADER_ACCEPT_POST, HTTP_HEADER_ACCEPT_QUERY } from './defs.js'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const { HTTP2_METHOD_POST, HTTP2_METHOD_PATCH } = http2.constants

const { HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>|string} acceptableMediaType
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, acceptableMediaType, supportedQueryTypes, meta) {
	const supportsQuery = supportedQueryTypes !== undefined && supportedQueryTypes.length > 0
	const exposedHeaders = supportsQuery ? [ HTTP_HEADER_ACCEPT_QUERY, HTTP_HEADER_ACCEPT_POST ] : [ HTTP_HEADER_ACCEPT_POST ]

	const method = HTTP2_METHOD_POST // todo pass in as parameter or split acceptable to post and patch types
	const acceptable = Array.isArray(acceptableMediaType) ? acceptableMediaType : [ acceptableMediaType ]
	const acceptHeader = (method === HTTP2_METHOD_POST) ? HTTP_HEADER_ACCEPT_POST : HTTP_HEADER_ACCEPT_PATCH
	const acceptValue = ((method === HTTP2_METHOD_POST) || (method === HTTP2_METHOD_PATCH)) ? acceptable.join(',') : undefined

	send(stream, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE, {
			[acceptHeader]: acceptValue,
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(',')
		}, exposedHeaders, undefined, undefined, meta)
}
