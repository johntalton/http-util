import http2 from 'node:http2'

import { Challenge } from '../../headers/www-authenticate.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */
/** @import { ChallengeItem } from '../../headers/www-authenticate.js' */

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
	send_no_body(stream, HTTP_STATUS_UNAUTHORIZED, {
			[HTTP2_HEADER_WWW_AUTHENTICATE]: Challenge.encode(challenge),
		}, [ HTTP2_HEADER_WWW_AUTHENTICATE ], meta)
}
