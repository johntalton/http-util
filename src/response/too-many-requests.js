import http2 from 'node:http2'
import { CONTENT_TYPE_TEXT } from '../content-type.js'
import {
	HTTP_HEADER_RATE_LIMIT,
	HTTP_HEADER_RATE_LIMIT_POLICY,
	RateLimit,
	RateLimitPolicy
} from '../rate-limit.js'
import { coreHeaders, performanceHeaders } from './header-util.js'


/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP2_HEADER_RETRY_AFTER
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
		...coreHeaders(HTTP_STATUS_TOO_MANY_REQUESTS, CONTENT_TYPE_TEXT, meta),
		...performanceHeaders(meta),

		[HTTP2_HEADER_RETRY_AFTER]: limitInfo.retryAfterS,
		[HTTP_HEADER_RATE_LIMIT]: RateLimit.from(limitInfo),
		[HTTP_HEADER_RATE_LIMIT_POLICY]: RateLimitPolicy.from(...policies)
	})

	stream.write(`Retry After ${limitInfo.retryAfterS} Seconds`)

	stream.end()
}

