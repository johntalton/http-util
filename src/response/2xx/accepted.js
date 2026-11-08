import { HTTP_HEADER_LOCATION } from '../../headers.js'
import { HTTP_STATUS_ACCEPTED } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata, SendContext } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL|string|undefined} location
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendAccepted(stream, location, context, meta) {
	const loc = (location instanceof URL) ? location.href : location
	// todo Assert.isString(loc) if not undefined

	send_no_body(stream, HTTP_STATUS_ACCEPTED, {
		[HTTP_HEADER_LOCATION]: loc
	}, [ HTTP_HEADER_LOCATION ], context, meta)
}
