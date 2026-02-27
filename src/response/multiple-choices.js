import http2 from 'node:http2'

import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const { HTTP_STATUS_MULTIPLE_CHOICES } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendMultipleChoices(stream, meta) {
	throw new Error('unsupported')
	send(stream, HTTP_STATUS_MULTIPLE_CHOICES, {
		// Alternates:
		// TCN: list
		// Vary: negotiate
	}, [], undefined, undefined, meta)
}
