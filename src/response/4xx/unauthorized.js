import { Challenge } from '../../headers/www-authenticate.js'
import { HTTP_HEADER_WWW_AUTHENTICATE } from '../../headers.js'
import { HTTP_STATUS_UNAUTHORIZED } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */
/** @import { ChallengeItem } from '../../headers/www-authenticate.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<ChallengeItem>|undefined} challenge
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendUnauthorized(stream, challenge, context, meta) {
	send_no_body(stream, HTTP_STATUS_UNAUTHORIZED, {
			[HTTP_HEADER_WWW_AUTHENTICATE]: Challenge.encode(challenge),
		}, [ HTTP_HEADER_WWW_AUTHENTICATE ], context, meta)
}
