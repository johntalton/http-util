import http2 from 'node:http2'

import { Conditional } from '../../headers/conditional.js'
import { send } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContent, Metadata } from '../../defs.js' */
/** @import { EtagItem ,IMFFixDateInput } from '../../headers/conditional.js' */

const {
	HTTP2_HEADER_ETAG,
	HTTP2_HEADER_LAST_MODIFIED
} = http2.constants

const { HTTP_STATUS_PRECONDITION_FAILED } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {EtagItem|undefined} etag
 * @param {IMFFixDateInput|string|undefined} lastModified
 * @param {Metadata} meta
 */
export function sendPreconditionFailed(stream, etag, lastModified, meta) {
	_sendPreconditionFailed(stream, {
		etag,
		lastModified
	}, meta)
}

/**
 * @param {ServerHttp2Stream} stream
 * @param {Pick<SendContent, 'etag' | 'lastModified'>} content
 * @param {Metadata} meta
 */
export function _sendPreconditionFailed(stream, content, meta) {
	const {
		etag,
		lastModified
	} = content

	send(stream, HTTP_STATUS_PRECONDITION_FAILED, {
		[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag),
		[HTTP2_HEADER_LAST_MODIFIED]: Conditional.encodeFixDate(lastModified)
	}, [], undefined, undefined, meta)
}
