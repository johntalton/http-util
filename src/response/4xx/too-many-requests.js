import http2 from 'node:http2'

import { CONTENT_TYPE_TEXT } from '../../headers/content-type.js'
import {
	HTTP_HEADER_RATE_LIMIT,
	HTTP_HEADER_RATE_LIMIT_POLICY,
	RateLimit,
	RateLimitPolicy
} from '../../headers/rate-limit.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_RETRY_AFTER
} = http2.constants

const { HTTP_STATUS_TOO_MANY_REQUESTS } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'limitInfo' | 'policies'>} info
 * @param {Metadata} meta
 */
export function sendTooManyRequests(stream, info, meta) {
	const {
		limitInfo,
		policies
	} = info

	send(stream, HTTP_STATUS_TOO_MANY_REQUESTS, {
			[HTTP2_HEADER_RETRY_AFTER]: `${limitInfo.resetSeconds}`,
			[HTTP_HEADER_RATE_LIMIT]: RateLimit.from(limitInfo),
			[HTTP_HEADER_RATE_LIMIT_POLICY]: RateLimitPolicy.from(...policies)
		},
		[
			HTTP2_HEADER_RETRY_AFTER,
			HTTP_HEADER_RATE_LIMIT,
			HTTP_HEADER_RATE_LIMIT_POLICY
		],
		CONTENT_TYPE_TEXT,
		`Retry After ${limitInfo.resetSeconds} Seconds`,
		meta)
}
