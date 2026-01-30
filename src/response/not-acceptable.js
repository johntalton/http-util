import http2 from 'node:http2'
import { MIME_TYPE_JSON } from '../content-type.js'
import { coreHeaders, performanceHeaders } from './header-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from './defs.js' */

const {
	HTTP_STATUS_NOT_ACCEPTABLE
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
		...coreHeaders(HTTP_STATUS_NOT_ACCEPTABLE, has ? MIME_TYPE_JSON : undefined, meta),
		...performanceHeaders(meta)
	})

	if(has) {
		stream.write(JSON.stringify(supportedTypes))
	}

	stream.end()
}
