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
	describe('permanentRedirect', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const location = new URL('http://check-over-here')
			Response.permanentRedirect(stream, location, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 308,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,location',
				'content-type': undefined,
				server: undefined,

				location: 'http://check-over-here/'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (location string)', () => {
			const stream = new MockHttp2Stream()
			const location = './'
			Response.permanentRedirect(stream, location, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 308,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,location',
				'content-type': undefined,
				server: undefined,

				location: './'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
