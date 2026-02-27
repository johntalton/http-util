import http2 from 'node:http2'

import { CONTENT_TYPE_JSON } from '../content-type.js'
import { send_encoded } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */
/** @import { CacheControlOptions } from '../cache-control.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Object} obj
 * @param {string|undefined} encoding
 * @param {EtagItem|undefined} etag
 * @param {number|undefined} age
 * @param {CacheControlOptions} cacheControl
 * @param {Array<string>|undefined} supportedQueryTypes
 * @param {Metadata} meta
 */
export function sendJSON_Encoded(stream, obj, encoding, etag, age, cacheControl, supportedQueryTypes, meta) {
	if(stream.closed) { return }

	const json = JSON.stringify(obj)
	send_encoded(stream, HTTP_STATUS_OK, CONTENT_TYPE_JSON, json, encoding, etag, age, cacheControl, undefined, supportedQueryTypes, meta)
}
