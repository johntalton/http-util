import { CONTENT_TYPE_JSON } from '../../headers/content-type.js'
import { HTTP_STATUS_OK } from '../../status.js'
import { send_encoded } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, SendInfo, SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {Object} obj
 * @param {Omit<SendContent, 'contentType' | 'contentLength' | 'rangeDirective'>} content
 * @param {Pick<SendInfo, 'supportedQueryTypes'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendJSON(stream, obj, content, info, context, meta) {
	const {
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

	if(stream.closed) { return }

	const json = JSON.stringify(obj)
	send_encoded(stream, HTTP_STATUS_OK, CONTENT_TYPE_JSON, json, contentDisposition, encoding, etag, lastModified, age, cacheControl, undefined, supportedQueryTypes, digest, context, meta)
}
