import { HTTP_HEADER_LOCATION } from '../../headers.js'
import { HTTP_STATUS_FOUND } from '../../status.js'
import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL|string} location
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendFound(stream, location, context, meta) {
	const loc = (location instanceof URL) ? location.href : location
	// todo Assert.isString(loc)

	send_no_body(stream, HTTP_STATUS_FOUND, {
		[HTTP_HEADER_LOCATION]: loc
	}, [ HTTP_HEADER_LOCATION ], context, meta)
}
