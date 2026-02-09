import http2 from 'node:http2'
import { HTTP_HEADER_ACCEPT_POST, HTTP_HEADER_ACCEPT_QUERY } from './defs.js'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const { HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>|string} acceptableMediaType
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, acceptableMediaType, supportedQueryTypes, meta) {
	const acceptable = Array.isArray(acceptableMediaType) ? acceptableMediaType : [ acceptableMediaType ]

	const supportsQuery = supportedQueryTypes !== undefined && supportedQueryTypes.length > 0
	const exposedHeaders = supportsQuery ? [ HTTP_HEADER_ACCEPT_QUERY, HTTP_HEADER_ACCEPT_POST ] : [ HTTP_HEADER_ACCEPT_POST ]

	send(stream, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE, {
			[HTTP_HEADER_ACCEPT_POST]: acceptable.join(','),
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(',')
		}, exposedHeaders, undefined, undefined, meta)
}
