import http2 from 'node:http2'

import { COMMON_LIST_VALUE_JOINER_COMMA, CUSTOM_HEADER_PREFIX, normalizeToArray, } from '../defs.js'

import {
	HTTP_HEADER_SERVER_TIMING,
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	ServerTiming
} from '../headers/server-timing.js'
import { ContentTypeOptions, HTTP_HEADER_CONTENT_TYPE_OPTIONS } from '../headers/x-content-type-options.js'
import { HTTP_HEADER_XSS_PROTECTION, XSSProtection } from '../headers/x-xss-protection.js'

/** @import { OutgoingHttpHeaders } from 'node:http2' */
/** @import { Metadata, SendSupportedTypes, SendSupportedTypesNormalizedRecord } from '../defs.js' */

const { HTTP2_METHOD_PUT, HTTP2_METHOD_POST, HTTP2_METHOD_PATCH } = http2.constants

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_EXPOSE_HEADERS,
	HTTP2_HEADER_ETAG,
	// HTTP2_HEADER_STRICT_TRANSPORT_SECURITY
} = http2.constants

/**
 * @description Headers that disable older technologies or methodologies that are outdated
 * @param {boolean} includeHeaders
 * @returns {OutgoingHttpHeaders}
 */
export function legacyHeaders(includeHeaders) {
	if(includeHeaders !== true) { return {} }

	return {
		[HTTP_HEADER_CONTENT_TYPE_OPTIONS]: ContentTypeOptions.encode(true),
		[HTTP_HEADER_XSS_PROTECTION]: XSSProtection.encode(false)
	}
}

/**
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {Array<string>} exposedHeaders
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function coreHeaders(status, contentType, exposedHeaders, meta) {
	// todo Assert.isArray or undefined exposedHeaders
	const exposed = [ HTTP2_HEADER_ETAG, HTTP2_HEADER_SERVER, ...exposedHeaders ] // todo include lastModified

	// todo Assert.isString(contentType) if not undefined
	// todo Assert.isString(meta.servername) if not undefined
	// todo Assert.isString(meta.origin) if not undefined

	return {
		// todo [HTTP2_HEADER_STRICT_TRANSPORT_SECURITY]: StrictTransportSecurity.encode(meta.hsts)
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_ACCESS_CONTROL_EXPOSE_HEADERS]: exposed.join(COMMON_LIST_VALUE_JOINER_COMMA),
		// Access-Control-Allow-Credentials // for non-preflight
		[HTTP2_HEADER_STATUS]: status,
		[HTTP2_HEADER_CONTENT_TYPE]: contentType,
		[HTTP2_HEADER_SERVER]: meta.servername
	}
}

/**
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function performanceHeaders(meta) {
	return {
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance)
	}
}

/**
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function customHeaders(meta) {
	const m = new Map(meta.customHeaders?.filter(h => h[0].startsWith(CUSTOM_HEADER_PREFIX)))
	return Object.fromEntries(m)
}

/**
 * @param {Array<string>|string|undefined} methods
 * @param {Array<string>|undefined} supportedTypesArray
 * @returns {SendSupportedTypesNormalizedRecord}
 */
export function coerceSupportedTypes_FromArray(methods, supportedTypesArray) {
	// Assert.isString(methods) if not array or undefined
	const methodsList = normalizeToArray(methods)

	const put = (methodsList?.includes(HTTP2_METHOD_PUT)) ? supportedTypesArray : undefined
	const post = (methodsList?.includes(HTTP2_METHOD_POST)) ? supportedTypesArray : undefined
	const patch = (methodsList?.includes(HTTP2_METHOD_PATCH)) ? supportedTypesArray : undefined

	return { put, post, patch }
}

/**
 * @param {Array<string>|string|undefined} methods
 * @param {SendSupportedTypes|undefined} supportedTypes
 * @returns {SendSupportedTypesNormalizedRecord}
 */
export function coerceSupportedTypes(methods, supportedTypes) {
	if(supportedTypes === undefined) {
		return {
			put: undefined,
			post: undefined,
			patch: undefined
		}
	}

	if(Array.isArray(supportedTypes)) {
		if(supportedTypes.length === 0) {
			return {
				put: undefined,
				post: undefined,
				patch: undefined
			}
		}
		return coerceSupportedTypes_FromArray(methods, supportedTypes)
	}

	if(typeof supportedTypes === 'string') {
		return coerceSupportedTypes_FromArray(methods, [ supportedTypes ])
	}

	// todo should this list be filtered by method or allowed to override
	// const methodsList = normalizeToArray(methods)
	return {
		put: normalizeToArray(supportedTypes.put),
		post: normalizeToArray(supportedTypes.post),
		patch: normalizeToArray(supportedTypes.patch)
	}
}
