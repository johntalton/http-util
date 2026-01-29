import http2 from 'node:http2'
import { MIME_TYPE_JSON } from '../content-type.js'
import {
	HTTP_HEADER_SERVER_TIMING,
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	ServerTiming
} from '../server-timing.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_NOT_ACCEPTABLE
} = http2.constants

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_SERVER,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Array<string>|string} supportedTypes
 * @param {Metadata} meta
 */
export function sendNotAcceptable(stream, supportedTypes, meta) {
	const supportedTypesList = Array.isArray(supportedTypes) ? supportedTypes : [ supportedTypes ]
	const has = supportedTypesList.length !== 0

	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_NOT_ACCEPTABLE,
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP2_HEADER_CONTENT_TYPE]: has ? MIME_TYPE_JSON : undefined,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance),
	})

	if(has) {
		stream.write(JSON.stringify(supportedTypes))
	}

	stream.end()
}
