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
	describe('rangeNotSatisfiable', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const rangeDirective = {}
			Response.rangeNotSatisfiable(stream, { rangeDirective }, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 416,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,content-range',
				'content-type': undefined,
				server: undefined,
				'content-range': 'bytes */*'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
