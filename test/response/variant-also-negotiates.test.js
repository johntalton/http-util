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
	describe('variantAlsoNegotiates', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			Response.variantAlsoNegotiates(stream, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 506,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				'retry-after': undefined,
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
			Response.variantAlsoNegotiates(stream, { problem }, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 506,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'application/problem+json',
				'retry-after': undefined,
				server: undefined
			})

			const decoder = new TextDecoder('utf-8', { fatal: true })
			const result = stream.read()
			const decoded = decoder.decode(result)
			assert.deepEqual(decoded, JSON.stringify({ ...problem, status: 506 }))
		})
	})
})