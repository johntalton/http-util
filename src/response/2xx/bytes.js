import http2 from 'node:http2'

import { send_bytes, send_encoded } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata, SendBody } from '../../defs.js' */
/** @import { EtagItem, IMFFixDateInput } from '../../headers/conditional.js' */
/** @import { CacheControlOptions } from '../../headers/cache-control.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendBody|undefined} obj
 * @param {string|undefined} contentType
 * @param {number|undefined} contentLength
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {'bytes'|'none'|undefined} acceptRanges
 * @param {Metadata} meta
 */
export function sendBytes(stream, contentType, obj, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, meta) {
	const supportedQueryType = undefined
	const range = undefined
	send_bytes(stream, HTTP_STATUS_OK, contentType, obj, range, contentLength, encoding, etag, lastModified, age, cacheControl, acceptRanges, supportedQueryType, meta)
	}
