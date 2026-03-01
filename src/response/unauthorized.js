import http2 from 'node:http2'

import { Challenge } from '../www-authenticate.js'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { ChallengeItem } from '../www-authenticate.js' */

const {
	HTTP2_HEADER_WWW_AUTHENTICATE
} = http2.constants

const { HTTP_STATUS_UNAUTHORIZED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<ChallengeItem>|undefined} challenge
 * @param {Metadata} meta
 */
export function sendUnauthorized(stream, challenge, meta) {
	send(stream, HTTP_STATUS_UNAUTHORIZED, {
			[HTTP2_HEADER_WWW_AUTHENTICATE]: challenge?.map(Challenge.encode),
		}, [ HTTP2_HEADER_WWW_AUTHENTICATE ], undefined, undefined, meta)
}
