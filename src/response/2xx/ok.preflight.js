import http2 from 'node:http2'

import {
	COMMON_LIST_VALUE_JOINER_COMMA,
	HTTP_HEADER_ACCEPT_PATCH,
	HTTP_HEADER_ACCEPT_POST,
	HTTP_HEADER_ACCEPT_QUERY,
	HTTP_METHOD_QUERY,
	HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE,
	isNonEmptyArray,
	PREFLIGHT_AGE_SECONDS,
} from '../../defs.js'
import { coerceSupportedTypes } from '../header-util.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, SendContext, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
	HTTP2_HEADER_IF_MATCH,
	HTTP2_HEADER_IF_NONE_MATCH,
	HTTP2_HEADER_AUTHORIZATION,
	HTTP2_HEADER_ACCEPT_RANGES,
	HTTP2_HEADER_RANGE,
	HTTP2_HEADER_IF_RANGE
} = http2.constants

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'supportedMethods' | 'supportedHeaders' | 'supportedTypes' | 'supportedQueryTypes' | 'acceptRanges'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendPreflight(stream, info, context, meta) {
	const {
		supportedMethods,
		supportedHeaders,
		supportedTypes,
		supportedQueryTypes,
		acceptRanges
	} = info

	const supportedTypesRecord = coerceSupportedTypes(supportedMethods, supportedTypes)

	const supportsQuery = supportedMethods.includes(HTTP_METHOD_QUERY) && isNonEmptyArray(supportedQueryTypes)

	const exposedHeaders = []
	if(acceptRanges !== undefined) { exposedHeaders.push(HTTP2_HEADER_ACCEPT_RANGES) }
	if(supportsQuery) { exposedHeaders.push(HTTP_HEADER_ACCEPT_QUERY) }
	// if(supportedTypesRecord.put !== undefined) { exposedHeaders.push(HTTP_HEADER_ACCEPT_PUT) }
	if(supportedTypesRecord.post !== undefined) { exposedHeaders.push(HTTP_HEADER_ACCEPT_POST) }
	if(supportedTypesRecord.patch !== undefined) { exposedHeaders.push(HTTP_HEADER_ACCEPT_PATCH) }

	const defaultSupportedHeaders = [
		HTTP2_HEADER_IF_MATCH,
		HTTP2_HEADER_IF_NONE_MATCH,
		HTTP2_HEADER_AUTHORIZATION,
		HTTP2_HEADER_CONTENT_TYPE, // overrides cors safe restriction (for json)
		HTTP2_HEADER_RANGE, // todo cors safe override not needed
		HTTP2_HEADER_IF_RANGE,
	]

	const disallowedHeaders = new Set([
		//
	])

	// union to prevent duplicates and clean
	const uniqueAllowedHeaders = new Set(defaultSupportedHeaders)
		.union(new Set(supportedHeaders))
		.difference(new Set(disallowedHeaders))
	const allowedHeaders = [ ...uniqueAllowedHeaders.keys() ] // todo should toLowercase be called on custom headers

	send_no_body(stream, HTTP_STATUS_OK, {
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_METHODS]: supportedMethods.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS]: allowedHeaders.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP2_HEADER_ACCESS_CONTROL_MAX_AGE]: PREFLIGHT_AGE_SECONDS,
			// [HTTP_HEADER_ACCEPT_PUT]: supportedTypesRecord.put?.join(COMMON_LIST_VALUE_JOINER_COMMA)
			[HTTP_HEADER_ACCEPT_POST]: supportedTypesRecord.post?.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP_HEADER_ACCEPT_PATCH]: supportedTypesRecord.patch?.join(COMMON_LIST_VALUE_JOINER_COMMA),
			[HTTP2_HEADER_ACCEPT_RANGES]: acceptRanges,
			[HTTP_HEADER_ACCEPT_QUERY]: supportsQuery ? supportedQueryTypes?.join(COMMON_LIST_VALUE_JOINER_COMMA) : undefined
			// Access-Control-Allow-Credentials
		}, exposedHeaders, context, meta)
}
