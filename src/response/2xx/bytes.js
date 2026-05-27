import http2 from 'node:http2'

import { send_bytes } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, Metadata, SendBody } from '../../defs.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendBody|undefined} obj
 * @param {Omit<SendContent, 'rangeDirective'>} content
 * @param {Pick<SendInfo, 'acceptRanges'>} info
 * @param {Metadata} meta
 */
export function sendBytes(stream, obj, content, info, meta) {
	const {
		contentType,
		contentLength,
		encoding,
		etag,
		lastModified,
		age,
		cacheControl,
	} = content

	const { acceptRanges } = info

	const supportedQueryType = undefined
	const range = undefined
	send_bytes(stream, HTTP_STATUS_OK, contentType, obj, range, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryType, meta)
}
