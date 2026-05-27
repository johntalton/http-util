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
	describe('sse', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			Response.sse(stream, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'text/event-stream',
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, Buffer.from('\xEF\xBB\xBF\r\n'))
		})

		it('should handle inactive stream values', () => {
			const stream = new MockHttp2Stream()
			const meta = {
				...DEFAULT_META,
				active: false,
				bom: true
			}
			Response.sse(stream, meta)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 204,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'text/event-stream',
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
