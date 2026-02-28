import http2 from 'node:http2'

import { CONTENT_TYPE_JSON } from '../content-type.js'
import { send } from './send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const { HTTP_STATUS_NOT_ACCEPTABLE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>|string} supportedTypes
 * @param {Metadata} meta
 */
export function sendNotAcceptable(stream, supportedTypes, meta) {
	const supportedTypesList = Array.isArray(supportedTypes) ? supportedTypes : [ supportedTypes ]
	const has = supportedTypesList.length > 0

	send(stream,
		HTTP_STATUS_NOT_ACCEPTABLE,
		{},
		[],
		has ? CONTENT_TYPE_JSON : undefined,
		has ? JSON.stringify(supportedTypes) : undefined,
		meta)
}
