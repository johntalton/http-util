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
	describe('notAcceptable', () => {
		it('should handle basic values (supported type array empty)', () => {
			const stream = new MockHttp2Stream()
			/** @type {string[]} */
			const supportedTypes = []
			Response.notAcceptable(stream, { supportedTypes }, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 406,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (supported type non-empty)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = [ 'text/plain', 'application/json' ]
			Response.notAcceptable(stream, { supportedTypes }, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 406,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'application/json;charset=utf8',
				server: undefined
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, Buffer.from(encoder.encode(JSON.stringify({ supportedTypes }))))
		})

		it('should handle basic values (supported type singular)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = 'application/json'
			Response.notAcceptable(stream, { supportedTypes }, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 406,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'application/json;charset=utf8',
				server: undefined
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, Buffer.from(encoder.encode(JSON.stringify({ supportedTypes: [ supportedTypes ] }))))
		})
	})

})