import { HTTP_STATUS_OK } from '../../status.js'
import { send_bytes } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, SendContext, Metadata, SendBody } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendBody|undefined} obj
 * @param {Omit<SendContent, 'rangeDirective'|'encoding'>} content
 * @param {Pick<SendInfo, 'acceptRanges'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendBytes(stream, obj, content, info, context, meta) {
	const {
		contentType,
		contentLength,
		contentDisposition,
		etag,
		lastModified,
		age,
		cacheControl,
		digest
	} = content

	const { acceptRanges } = info
	const supportedQueryType = undefined
	const range = undefined
	const encoding = undefined

	// send_encoded(stream, HTTP_STATUS_OK, contentType, obj, contentDisposition,                       encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryType, digest, context, meta)
	send_bytes(stream,   HTTP_STATUS_OK, contentType, obj, contentDisposition, range, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryType, digest, context, meta)
}
