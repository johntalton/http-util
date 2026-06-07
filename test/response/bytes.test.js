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
	describe('bytes', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const contentType = undefined
			const contentLength = undefined
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const acceptRanges = undefined
			const obj = 'TEST'
			Response.bytes(stream, obj, {
				contentType,
				contentLength,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl
			}, {
				acceptRanges
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': undefined,
				'cache-control': undefined,
				'content-encoding': undefined,
				'content-length': undefined,
				'content-range': undefined,
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding'
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, Buffer.from('TEST'))
		})
	})
})