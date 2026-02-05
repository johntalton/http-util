import http2 from 'node:http2'
import {
	SSE_MIME,
	SSE_INACTIVE_STATUS_CODE,
	SSE_BOM,
	ENDING,
} from '@johntalton/sse-util'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata, SSEOptions } from './defs.js' */

const { HTTP_STATUS_OK } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {SSEOptions & Metadata} meta
 */
export function sendSSE(stream, meta) {
	const activeStream = meta.active ?? true
	const sendBOM = meta.bom ?? true

	const status = activeStream ? HTTP_STATUS_OK : SSE_INACTIVE_STATUS_CODE

	stream.respond({
		...coreHeaders(status, SSE_MIME, [], meta),
		...performanceHeaders(meta)

		// [HTTP2_HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS]: 'true'
	})

	if(!activeStream) {
		stream.end()
		return
	}

	if(sendBOM) {
		stream.write(SSE_BOM + ENDING.CRLF)
	}
}
