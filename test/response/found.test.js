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
	describe('found', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const location = new URL('http://Test/test.html')
			Response.found(stream, location, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 302,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,location',
				'content-type': undefined,
				server: undefined,

				location: 'http://test/test.html'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
