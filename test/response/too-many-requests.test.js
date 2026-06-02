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
	describe('error', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const limitInfo = {
				name: 'Test',
				remaining: 42,
				resetSeconds: 77
			}
			const policies = [{
				name: 'TestPolicy',
				quota: 1000,
				size: 2000,
				quotaUnits: 'request',
				windowSeconds: 60
			}]
			Response.tooManyRequests(stream, { limitInfo, policies }, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 429,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,retry-after,RateLimit,RateLimit-Policy',
				'content-type': 'text/plain;charset=utf8',
				server: undefined,

				'RateLimit': '"Test";r=42;t=77',
				'RateLimit-Policy': '"TestPolicy";q=1000;qu="request";w=60',
				'retry-after': '77'
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			const message = 'Retry After 77 Seconds'
			assert.deepEqual(result, Buffer.from(encoder.encode(message)))
		})
	})
})