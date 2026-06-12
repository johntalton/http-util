import http2 from 'node:http2'

import { CONTENT_TYPE_JSON } from '../../headers/content-type.js'
import { send_encoded } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, Metadata } from '../../defs.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Object} obj
 * @param {Omit<SendContent, 'contentType' | 'contentLength' | 'rangeDirective'>} content
 * @param {Pick<SendInfo, 'supportedQueryTypes'>} info
 * @param {Metadata} meta
 */
export function sendJSON(stream, obj, content, info, meta) {
	const {
		encoding,
		etag,
		lastModified,
		age,
		cacheControl
	} = content

	const {
		supportedQueryTypes
	} = info

	if(stream.closed) { return }

	const json = JSON.stringify(obj)
	send_encoded(stream, HTTP_STATUS_OK, CONTENT_TYPE_JSON, json, encoding, etag, lastModified, age, cacheControl, undefined, supportedQueryTypes, meta)
}
