import http2 from 'node:http2'

import { CONTENT_TYPE_JSON } from '../../headers/content-type.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendInfo, Metadata } from '../../defs.js' */

const { HTTP_STATUS_NOT_ACCEPTABLE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'supportedTypes'>} info
 * @param {Metadata} meta
 */
export function sendNotAcceptable(stream, info, meta) {
	const { supportedTypes } = info

	const supportedTypesList = Array.isArray(supportedTypes) ? supportedTypes : [ supportedTypes ]
	const has = supportedTypesList.length > 0

	send(stream,
		HTTP_STATUS_NOT_ACCEPTABLE,
		{},
		[],
		has ? CONTENT_TYPE_JSON : undefined,
		has ? JSON.stringify({ supportedTypes: supportedTypesList }) : undefined,
		meta)
}
