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
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const supportedQueryTypes = undefined
			const obj = { test: true, param: 42 }
			Response.json(stream, obj, {
				encoding,
				etag,
				lastModified,
				age,
				cacheControl
			}, {
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': 'encode;dur=0',
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'application/json',
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
			assert.deepEqual(result, Buffer.from('{"test":true,"param":42}'))
		})

		it('should handle exit early on closed stream', () => {
			const stream = new MockHttp2Stream()

			stream.close()

			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const supportedQueryTypes = undefined
			const obj = { test: true, param: 42 }
			Response.json(stream, obj, {
				encoding,
				etag,
				lastModified,
				age,
				cacheControl
			}, {
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, false)
			assert.deepEqual(stream.sentHeaders, {})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
