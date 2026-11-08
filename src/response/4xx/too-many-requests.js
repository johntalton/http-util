import {
	RateLimit,
	RateLimitPolicy
} from '../../headers/rate-limit.js'
import { RetryAfter } from '../../headers/retry-after.js'
import {
	HTTP_HEADER_RATE_LIMIT,
	HTTP_HEADER_RATE_LIMIT_POLICY,
	HTTP_HEADER_RETRY_AFTER,
} from '../../headers.js'
import { HTTP_STATUS_TOO_MANY_REQUESTS } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendInfo, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'limitInfo' | 'policies'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendTooManyRequests(stream, info, context, meta) {
	const {
		limitInfo,
		policies
	} = info

	send_no_body(stream, HTTP_STATUS_TOO_MANY_REQUESTS, {
			[HTTP_HEADER_RETRY_AFTER]: RetryAfter.encode(limitInfo.resetSeconds),
			[HTTP_HEADER_RATE_LIMIT]: RateLimit.encode(limitInfo),
			[HTTP_HEADER_RATE_LIMIT_POLICY]: RateLimitPolicy.encode(policies)
		},
		[
			HTTP_HEADER_RETRY_AFTER,
			HTTP_HEADER_RATE_LIMIT,
			HTTP_HEADER_RATE_LIMIT_POLICY
		],
		context,
		meta)
}
