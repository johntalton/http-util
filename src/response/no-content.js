import http2 from 'node:http2'
import { send } from './send-util.js'
import { Conditional } from '../conditional.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */
/** @import { EtagItem } from '../conditional.js' */

const {
	HTTP2_HEADER_ETAG
} = http2.constants

const { HTTP_STATUS_NO_CONTENT } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {EtagItem|undefined} etag
 * @param {Metadata} meta
 */
export function sendNoContent(stream, etag, meta) {
	send(stream, HTTP_STATUS_NO_CONTENT, {
			[HTTP2_HEADER_ETAG]: Conditional.encodeEtag(etag)
		}, undefined, undefined, meta)
}
