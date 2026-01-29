import http2 from 'node:http2'
import {
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	HTTP_HEADER_SERVER_TIMING,
	ServerTiming
} from '../server-timing.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
  HTTP_STATUS_ACCEPTED
} = http2.constants

const {
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_SERVER,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN
} = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendAccepted(stream, meta) {
	stream.respond({
		[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP2_HEADER_STATUS]: HTTP_STATUS_ACCEPTED,
		[HTTP2_HEADER_SERVER]: meta.servername,
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance)
	})
	stream.end()
}