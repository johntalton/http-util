import http2 from 'node:http2'

import { send_encoded } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, Metadata, SendBody } from '../../defs.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendBody} obj
 * @param {Omit<SendContent, 'rangeDirective' | 'contentLength'>} content
 * @param {Pick<SendInfo, 'supportedQueryTypes'>} info
 * @param {Metadata} meta
 */
export function sendEncoded(stream, obj, content, info, meta) {
	const {
		contentType,
		encoding,
		etag,
		lastModified,
		age,
		cacheControl
	} = content
	const {
		supportedQueryTypes
	} = info

	const acceptRanges = undefined
	send_encoded(stream, HTTP_STATUS_OK, contentType, obj, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, meta)
}