import http2 from 'node:http2'

import { Conditional } from '../../headers/conditional.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, Metadata } from '../../defs.js' */

const {
	HTTP2_HEADER_LOCATION,
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED
} = http2.constants

const { HTTP_STATUS_CREATED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {URL} location
 * @param {Pick<SendContent, 'etag' | 'lastModified'>} content
 * @param {Metadata} meta
 */
export function sendCreated(stream, location, content, meta) {
	const {
		etag,
		lastModified
	} = content

	send(stream, HTTP_STATUS_CREATED, {
			[HTTP2_HEADER_LOCATION]: location.href,
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
			[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified)
		}, [ HTTP2_HEADER_LOCATION ], undefined, undefined, meta)
}
