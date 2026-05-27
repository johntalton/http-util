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
	describe('noContent', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const etag = undefined
			const lastModified = undefined
			Response.noContent(stream, etag, lastModified, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 204,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined,

				etag: undefined,
				'last-modified': undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
