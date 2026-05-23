import http2 from 'node:http2'

import { RANGE_UNITS_BYTES } from '../../defs.js'
import { MIME_TYPE_MULTIPART_RANGE } from '../../headers/content-type.js'
import { Multipart } from '../../headers/multipart.js'
import { send_bytes } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata, SendBody } from '../../defs.js' */
/** @import { EtagItem, IMFFixDateInput } from '../../headers/conditional.js' */
/** @import { CacheControlOptions } from '../../headers/cache-control.js' */
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
 * @param {ServerHttp2Stream} stream
 * @param {string} contentType
 * @param {NonEmptyArray<PartialBytes>|PartialBytes} objs
 * @param {number|undefined} contentLength
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {Metadata} meta
 */
export function sendPartialContent(stream, contentType, objs, contentLength, encoding, etag, lastModified, age, cacheControl, meta) {
	const acceptRanges = RANGE_UNITS_BYTES
	const supportedQueryTypes = undefined

	if(Array.isArray(objs) && objs.length > 1) {
		// send using multipart bytes
		const boundary = 'PARTIAL_CONTENT_BOUNDARY' // todo make unique for content
		const obj = Multipart.encode_Bytes(contentType, objs, contentLength, boundary)

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
