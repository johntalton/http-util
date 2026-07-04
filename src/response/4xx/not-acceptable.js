import http2 from 'node:http2'

import { isNonEmptyArray, normalizeToArray } from '../../defs.js'
import { CONTENT_TYPE_JSON } from '../../headers/content-type.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, SendInfo, Metadata } from '../../defs.js' */

const { HTTP_STATUS_NOT_ACCEPTABLE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendInfo, 'acceptableTypes'>} info
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendNotAcceptable(stream, info, context, meta) {
	const { acceptableTypes } = info

	const acceptableTypesList = normalizeToArray(acceptableTypes)
	const has = isNonEmptyArray(acceptableTypesList)

	send(stream,
		HTTP_STATUS_NOT_ACCEPTABLE,
		{},
		[],
		has ? CONTENT_TYPE_JSON : undefined,
		has ? JSON.stringify({ types: acceptableTypesList }) : undefined,
		context,
		meta)
}
