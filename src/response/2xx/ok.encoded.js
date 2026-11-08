import { HTTP_STATUS_OK } from '../../status.js'
import { send_encoded } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, SendContext, Metadata, SendBody } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendBody|undefined} obj
 * @param {Omit<SendContent, 'rangeDirective' | 'contentLength'>} content
 * @param {Pick<SendInfo, 'supportedQueryTypes'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendEncoded(stream, obj, content, info, context, meta) {
	const {
		contentType,
		contentDisposition,
		encoding,
		etag,
		lastModified,
		age,
		cacheControl,
		digest
	} = content
	const {
		supportedQueryTypes
	} = info

	const acceptRanges = undefined
	send_encoded(stream, HTTP_STATUS_OK, contentType, obj, contentDisposition, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, digest, context, meta)
}