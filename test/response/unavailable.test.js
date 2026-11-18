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
	describe('unavailable', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const message = 'This Is a Test'
			const retryAfter = 42
			Response.unavailable(stream, message, { retryAfter }, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 503,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,retry-after',
				'content-type': undefined,
				'retry-after': '42',
				server: undefined
			})


			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (with problem)', () => {
			const stream = new MockHttp2Stream()
			const problem = {
				type: 'urn:test',
				title: 'Test',
				detail: 'This is a Test'
			}
			const retryAfter = 42
			Response.unavailable(stream, undefined, { retryAfter }, { problem }, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 503,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,retry-after',
				'content-type': 'application/problem+json',
				'retry-after': '42',
				server: undefined
			})

			const decoder = new TextDecoder('utf-8', { fatal: true })
			const result = stream.read()
			const decoded = decoder.decode(result)
			assert.deepEqual(decoded, JSON.stringify({ ...problem, status: 503 }))
		})
	})
})