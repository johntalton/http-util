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
	describe('notModified', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			Response.notModified(stream, {
				etag,
				lastModified,
				age,
				cacheControl
			}, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 304,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,age',
				'content-type': undefined,
				server: undefined,

				'cache-control': undefined,
				age: undefined,
				etag: undefined,
				'last-modified': undefined,
				vary: 'Accept, Accept-Encoding'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})


	})
})
