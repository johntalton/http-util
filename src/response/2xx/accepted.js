import http2 from 'node:http2'

import { send_no_body } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_LOCATION
} = http2.constants

const { HTTP_STATUS_ACCEPTED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL|string|undefined} location
 * @param {Metadata} meta
 */
export function sendAccepted(stream, location, meta) {
	const loc = (location instanceof URL) ? location.href : location

	send_no_body(stream, HTTP_STATUS_ACCEPTED, {
		[HTTP2_HEADER_LOCATION]: loc
	}, [ HTTP2_HEADER_LOCATION ], meta)
}
