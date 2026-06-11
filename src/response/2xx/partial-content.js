import http2 from 'node:http2'

import { RANGE_UNITS_BYTES } from '../../defs.js'
import { MIME_TYPE_MULTIPART_RANGE, MIME_TYPE_OCTET_STREAM } from '../../headers/content-type.js'
import { Multipart } from '../../headers/multipart.js'
import { send_bytes } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, Metadata, SendBody } from '../../defs.js' */
/** @import { ContentRangeDirective } from '../../headers/content-range.js' */

const { HTTP_STATUS_PARTIAL_CONTENT } = http2.constants

/**
 * @template T
 * @typedef {[ T, ...T[] ]} NonEmptyArray
 */

/**
 * @typedef {Object} PartialBytes
 * @property {SendBody} obj
 * @property {ContentRangeDirective} range
 */

/**
 * @template T
 * @param {Array<T>} arr
 * @returns {arr is NonEmptyArray}
 */
export function isNonEmptyArray(arr) {
	if(!Array.isArray(arr)) { return false }
  return arr.length > 0
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {NonEmptyArray<PartialBytes>|PartialBytes} objs
 * @param {Omit<SendContent, 'rangeDirective'>} content
 * @param {Metadata} meta
 */
export function sendPartialContent(stream, objs, content, meta) {
	const {
		contentType,
		contentLength,
		encoding,
		etag,
		lastModified,
		age,
		cacheControl
	} = content

	const acceptRanges = RANGE_UNITS_BYTES
	const supportedQueryTypes = undefined

	if(Array.isArray(objs) && objs.length > 1) {
		// send using multipart bytes
		const boundary = 'PARTIAL_CONTENT_BOUNDARY' // todo make unique for content
		const obj = Multipart.encode_Bytes(contentType ?? MIME_TYPE_OCTET_STREAM, objs, contentLength, boundary)

		const multipartContentType = `${MIME_TYPE_MULTIPART_RANGE}; boundary=${boundary}`

		send_bytes(
			stream,
			HTTP_STATUS_PARTIAL_CONTENT,
			multipartContentType,
			obj,
			undefined,
			undefined,
			encoding,
			etag,
			lastModified,
			age,
			cacheControl,
			acceptRanges,
			supportedQueryTypes,
			meta)

		return
	}

	// single range, send as regular object
	const obj = Array.isArray(objs) ? objs[0] : objs
	send_bytes(stream, HTTP_STATUS_PARTIAL_CONTENT, contentType, obj.obj, obj.range, undefined, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryTypes, meta)
}
