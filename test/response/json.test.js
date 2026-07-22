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
	describe('json', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const contentDisposition = undefined
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const supportedQueryTypes = undefined
			const obj = { test: true, param: 42 }
			Response.json(stream, obj, {
				contentDisposition,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl
			}, {
				supportedQueryTypes
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)

			assert.deepEqual(stream.sentHeaders[':status'], 200)
			// assert.deepEqual(stream.sentHeaders['Server-Timing'], 'encode;dur=0')
			assert.deepEqual(stream.sentHeaders['Timing-Allow-Origin'], undefined)
			assert.deepEqual(stream.sentHeaders['access-control-allow-origin'], undefined)
			assert.deepEqual(stream.sentHeaders['access-control-expose-headers'], 'etag,server')
			assert.deepEqual(stream.sentHeaders['content-type'], 'application/json')
			assert.deepEqual(stream.sentHeaders['server'], undefined)

			assert.deepEqual(stream.sentHeaders['accept-query'], undefined)
			assert.deepEqual(stream.sentHeaders['accept-ranges'], undefined)
			assert.deepEqual(stream.sentHeaders['cache-control'], undefined)
			assert.deepEqual(stream.sentHeaders['content-disposition'], undefined)
			assert.deepEqual(stream.sentHeaders['content-encoding'], undefined)
			assert.deepEqual(stream.sentHeaders['content-length'], undefined)
			assert.deepEqual(stream.sentHeaders['content-range'], undefined)
			assert.deepEqual(stream.sentHeaders['last-modified'], undefined)
			assert.deepEqual(stream.sentHeaders['age'], undefined)
			assert.deepEqual(stream.sentHeaders['etag'], undefined)
			assert.deepEqual(stream.sentHeaders['vary'], 'accept,accept-encoding')


			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, Buffer.from('{"test":true,"param":42}'))
		})

		it('should handle exit early on closed stream', () => {
			const stream = new MockHttp2Stream()

			stream.close()

			const contentDisposition = undefined
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const supportedQueryTypes = undefined
			const obj = { test: true, param: 42 }
			Response.json(stream, obj, {
				contentDisposition,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl
			}, {
				supportedQueryTypes
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, false)
			assert.deepEqual(stream.sentHeaders, {})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
