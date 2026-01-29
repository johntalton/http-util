import http2 from 'node:http2'
import { CONTENT_TYPE_TEXT } from '../content-type.js'
import {
	HTTP_HEADER_RATE_LIMIT,
	HTTP_HEADER_RATE_LIMIT_POLICY,
	RateLimit,
	RateLimitPolicy
} from '../rate-limit.js'


/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_RETRY_AFTER,
	HTTP2_HEADER_CONTENT_TYPE
} = http2.constants

const {
	HTTP_STATUS_TOO_MANY_REQUESTS
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {*} limitInfo
 * @param {Array<any>} policies
 * @param {Metadata} meta
 */
export function sendTooManyRequests(stream, limitInfo, policies, meta) {
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_TOO_MANY_REQUESTS,
		[HTTP2_HEADER_CONTENT_TYPE]: CONTENT_TYPE_TEXT,
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP2_HEADER_RETRY_AFTER]: limitInfo.retryAfterS,
		[HTTP_HEADER_RATE_LIMIT]: RateLimit.from(limitInfo),
		[HTTP_HEADER_RATE_LIMIT_POLICY]: RateLimitPolicy.from(...policies)
	})

	stream.write(`Retry After ${limitInfo.retryAfterS} Seconds`)

	stream.end()
}

