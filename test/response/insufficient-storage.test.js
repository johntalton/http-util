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
	describe('insufficientStorage', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			Response.insufficientStorage(stream, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 507,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'application/json;charset=utf8',
				server: undefined,

				'retry-after': undefined
			})

			const result = stream.read()
			const encoder = new TextEncoder()
			assert.deepEqual(result, Buffer.from(encoder.encode(JSON.stringify({ message: 'Insufficient Storage' }))))
		})
	})
})
