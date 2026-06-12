import http2 from 'node:http2'

import {
	COMMON_LIST_VALUE_JOINER_COMMA,
	HTTP_HEADER_ACCEPT_PATCH,
	HTTP_HEADER_ACCEPT_POST,
	HTTP_HEADER_ACCEPT_QUERY
} from '../../defs.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, Metadata, SendSupportedTypes, SendSupportedTypesNormalizedRecord } from '../../defs.js' */

const { HTTP2_METHOD_PUT, HTTP2_METHOD_POST, HTTP2_METHOD_PATCH } = http2.constants

const { HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE } = http2.constants

/**
 * @template T
 * @param {Array<T>|T|undefined} item
 * @returns {Array<T>|undefined}
 */
function normalizeToArray(item) {
	if(item === undefined) { return undefined }
	if(Array.isArray(item)) { return item }
	return [ item ]
}

/**
 * @param {string|undefined} method
 * @param {Array<string>|undefined} supportedTypesArray
 * @returns {SendSupportedTypesNormalizedRecord}
 */
function coerceSupportedTypes_FromArray(method, supportedTypesArray) {
	const put = (method === HTTP2_METHOD_PUT) ? supportedTypesArray : undefined
	const post = (method === HTTP2_METHOD_POST) ? supportedTypesArray : undefined
	const patch = (method === HTTP2_METHOD_PATCH) ? supportedTypesArray : undefined

	return { put, post, patch }
}

/**
 * @param {string|undefined} method
 * @param {SendSupportedTypes|undefined} supportedTypes
 * @returns {SendSupportedTypesNormalizedRecord}
 */
export function coerceSupportedTypes(method, supportedTypes) {
	if(supportedTypes === undefined) {
		return {
			put: undefined,
			post: undefined,
			patch: undefined
		}
	}

	if(Array.isArray(supportedTypes)) {
		return coerceSupportedTypes_FromArray(method, supportedTypes)
	}

	if(typeof supportedTypes === 'string') {
		return coerceSupportedTypes_FromArray(method, [ supportedTypes ])
	}

	return {
		put: normalizeToArray(supportedTypes.put),
		post: normalizeToArray(supportedTypes.post),
		patch: normalizeToArray(supportedTypes.patch)
	}
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {string|undefined} method
 * @param {Pick<SendInfo, 'supportedTypes' | 'supportedQueryTypes'>} info
 * @param {Metadata} meta
 */
export function sendUnsupportedMediaType(stream, method, info, meta) {
	const {
		supportedQueryTypes,
		supportedTypes,
	} = info

	const supportedTypesRecord = coerceSupportedTypes(method, supportedTypes)

	const exposedHeaders = []
	if(supportedQueryTypes !== undefined) { exposedHeaders.push(HTTP_HEADER_ACCEPT_QUERY) }
	// if(supportedTypesRecord.put) { exposedHeaders.push(HTTP_HEADER_ACCEPT_PUT) }
	if(supportedTypesRecord.post) { exposedHeaders.push(HTTP_HEADER_ACCEPT_POST) }
	if(supportedTypesRecord.patch) { exposedHeaders.push(HTTP_HEADER_ACCEPT_PATCH) }

	send_no_body(stream, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE, {
		// [HTTP_HEADER_ACCEPT_PUT]: supportedTypesRecord.put?.join(COMMON_LIST_VALUE_JOINER_COMMA)
			[HTTP_HEADER_ACCEPT_POST]: supportedTypesRecord.post?.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP_HEADER_ACCEPT_PATCH]: supportedTypesRecord.patch?.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP_HEADER_ACCEPT_QUERY]: supportedQueryTypes?.join(COMMON_LIST_VALUE_JOINER_COMMA)
		}, exposedHeaders, meta)
}
