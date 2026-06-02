import http2 from 'node:http2'

import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_LOCATION
} = http2.constants

const { HTTP_STATUS_MOVED_PERMANENTLY } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL|string} location
 * @param {Metadata} meta
 */
export function sendMovedPermanently(stream, location, meta) {
	const loc = (location instanceof URL) ? location.href : location

	send(stream, HTTP_STATUS_MOVED_PERMANENTLY, {
		[HTTP2_HEADER_LOCATION]: loc
	}, [HTTP2_HEADER_LOCATION], undefined, undefined, meta)
}
