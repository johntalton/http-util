import http2 from 'node:http2'
import { send_bytes } from './send-util.js'
import { RANGE_UNITS_BYTES } from "./defs.js"
import { Multipart } from '../multipart.js'
import { MIME_TYPE_MULTIPART_RANGE } from '../content-type.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */
/** @import { CacheControlOptions } from '../cache-control.js' */
/** @import { ContentRangeDirective } from '../content-range.js' */
/** @import { SendBody } from './send-util.js' */

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
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {Metadata} meta
 */
export function sendPartialContent(stream, contentType, objs, contentLength, encoding, etag, age, cacheControl, meta) {
	const acceptRanges = RANGE_UNITS_BYTES
	const supportedQueryTypes = undefined

	if(Array.isArray(objs) && objs.length > 1) {
		// send using multipart bytes
		// console.log('sendPartialContent - mulipart')

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
			age,
			cacheControl,
			acceptRanges,
			supportedQueryTypes,
			meta)

		return
	}


	const obj = Array.isArray(objs) ? objs[0] : objs
	send_bytes(stream, HTTP_STATUS_PARTIAL_CONTENT, contentType, obj.obj, obj.range, undefined, encoding, etag, age, cacheControl, acceptRanges, supportedQueryTypes, meta)
}
