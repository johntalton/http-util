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
	describe('created', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const location = new URL('http://brand-new')
			const etag = undefined
			const lastModified = undefined
			Response.created(stream, location, { etag, lastModified }, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 201,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,location',
				'content-type': undefined,
				server: undefined,

				etag: undefined,
				'last-modified': undefined,
				location: 'http://brand-new/'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (location string)', () => {
			const stream = new MockHttp2Stream()
			const location = '//foo/bar'
			const etag = undefined
			const lastModified = undefined
			Response.created(stream, location, { etag, lastModified }, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 201,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,location',
				'content-type': undefined,
				server: undefined,

				etag: undefined,
				'last-modified': undefined,
				location: '//foo/bar'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
