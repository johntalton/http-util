import http2 from 'node:http2'
import {
	SSE_MIME,
	SSE_INACTIVE_STATUS_CODE,
	SSE_BOM,
	ENDING,
} from '@johntalton/sse-util'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata, SSEOptions } from './defs.js' */

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP2_HEADER_SERVER
} = http2.constants

const {
	HTTP_STATUS_OK,
	HTTP_STATUS_NO_CONTENT
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {SSEOptions & Metadata} meta
 */
export function sendSSE(stream, meta) {
	// stream.setTimeout(0)
	// stream.session?.setTimeout(0)
	// stream.session?.socket.setTimeout(0)
	// stream.session.socket.setNoDelay(true)
	// stream.session.socket.setKeepAlive(true)

	// stream.on('close', () => console.log('SSE stream closed'))
	// stream.on('aborted', () => console.log('SSE stream aborted'))

	const activeStream = meta.active ?? true
	const sendBOM = meta.bom ?? true

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_CONTENT_TYPE]: SSE_MIME,
		[HTTP2_HEADER_STATUS]: activeStream ? HTTP_STATUS_OK : HTTP_STATUS_NO_CONTENT, // SSE_INACTIVE_STATUS_CODE
		// [HTTP2_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS]: 'true'
		[HTTP2_HEADER_SERVER]: meta.servername
	 })

	 if(!activeStream) {
		stream.end()
		return
	 }

	if(sendBOM) {
		stream.write(SSE_BOM + ENDING.CRLF)
	}
}
