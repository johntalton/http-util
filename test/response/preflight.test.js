import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Response } from '@johntalton/http-util/response/object'

import { MockHttp2Stream } from '../mock-http2-stream.js'

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

describe('Response', () => {
	describe('preflight', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'TEST', 'FAKE' ]
			const supportedQueryTypes = [ 'text/sql' ]
			const acceptRanges = undefined

			Response.preflight(stream, supportedMethods, supportedQueryTypes, acceptRanges, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined,

				'accept-query': 'text/sql',
				'accept-ranges': undefined,
				'access-control-allow-methods': 'TEST,FAKE',
				'access-control-allow-headers': 'if-match,if-none-match,authorization,content-type,range,if-range',
				'access-control-max-age': '500'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values alt', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'TEST', 'QUERY' ]
			const supportedQueryTypes = [ 'text/sql' ]
			const acceptRanges = 'bytes'

			Response.preflight(stream, supportedMethods, supportedQueryTypes, acceptRanges, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-ranges,accept-query',
				'content-type': undefined,
				server: undefined,

				'accept-query': 'text/sql',
				'accept-ranges': 'bytes',
				'access-control-allow-methods': 'TEST,QUERY',
				'access-control-allow-headers': 'if-match,if-none-match,authorization,content-type,range,if-range',
				'access-control-max-age': '500'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
