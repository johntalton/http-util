import http2 from 'node:http2'

import { send_bytes } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, SendContext, Metadata, SendBody } from '../../defs.js' */

const { HTTP_STATUS_OK } = http2.constants

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

	send_bytes(stream, HTTP_STATUS_OK, contentType, obj, contentDisposition, range, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryType, digest, context, meta)
}
