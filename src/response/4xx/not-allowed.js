import http2 from 'node:http2'

import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, Metadata } from '../../defs.js' */

const {
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = http2.constants

const { HTTP2_HEADER_ALLOW } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'supportedMethods'>} info
 * @param {Metadata} meta
 */
export function sendNotAllowed(stream, info, meta) {
	const { supportedMethods } = info

	send(stream, HTTP_STATUS_METHOD_NOT_ALLOWED, {
			[HTTP2_HEADER_ALLOW]: supportedMethods.join(',')
		}, [ HTTP2_HEADER_ALLOW ], undefined, undefined, meta)
}
