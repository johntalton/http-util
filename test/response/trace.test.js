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
	describe('trace', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const method = 'TEST'
			const url = new URL('http://this/is a test')
			const headers = {
				'X-Testing': 'TEST',
				':status': 'pseudo-gets-dropped',
				'cookie': 'secret-gets-dropped'
			}

			Response.trace(stream, method, url, headers, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'message/http',
				server: undefined
			})

			const encoder = new TextEncoder()

			const message = [
				'TEST /is%20a%20test HTTP/2',
				'X-Testing: TEST',
				'\n'
			].join('\n')

			const result = stream.read()
			assert.deepEqual(result, Buffer.from(encoder.encode(message)))
		})
	})
})
