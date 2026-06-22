import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import zlib from 'node:zlib'

import { Response } from '@johntalton/http-util/response/object'

import { MockHttp2Stream } from '../mock-http2-stream.js'

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

describe('Response', () => {
	describe('encoded', () => {
		it('should handle undefined body undefined encoding', () => {
			const stream = new MockHttp2Stream()
			const obj = undefined
			Response.encoded(stream, obj, {
				contentType: undefined,
				encoding: undefined,
				age: undefined,
				etag: undefined,
				lastModified: undefined,
				cacheControl: {}
			}, {
				supportedQueryTypes: undefined
			}, structuredClone(DEFAULT_META))


			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': 'encode;dur=0',
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

			const result = stream.read()
			assert.equal(result, null)

		})

		it('should handle undefined body with identity encoding', () => {
			const stream = new MockHttp2Stream()
			const obj = undefined
			Response.encoded(stream, obj, {
				contentType: undefined,
				encoding: 'identity',
				age: undefined,
				etag: undefined,
				lastModified: undefined,
				cacheControl: {}
			}, {
				supportedQueryTypes: undefined
			}, structuredClone(DEFAULT_META))


			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': 'encode;dur=0',
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': undefined,
				'cache-control': undefined,
				'content-encoding': 'identity',
				'content-length': undefined,
				'content-range': undefined,
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding'
			})

			const result = stream.read()
			assert.equal(result, null)

		})

		it('should handle undefined body with gzip encoding', () => {
			const stream = new MockHttp2Stream()
			const obj = undefined
			Response.encoded(stream, obj, {
				contentType: undefined,
				encoding: 'gzip',
				age: undefined,
				etag: undefined,
				lastModified: undefined,
				cacheControl: {}
			}, {
				supportedQueryTypes: undefined
			}, structuredClone(DEFAULT_META))


			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': 'encode;dur=0',
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': undefined,
				'cache-control': undefined,
				'content-encoding': 'gzip',
				'content-length': undefined,
				'content-range': undefined,
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding'
			})

			const result = stream.read()
			assert.equal(result, null)

		})

		it('should handle identity encoding', () => {
			const stream = new MockHttp2Stream()
			const obj = Buffer.from('TESTING')
			Response.encoded(stream, obj, {
				contentType: undefined,
				encoding: 'identity',
				age: undefined,
				etag: undefined,
				lastModified: undefined,
				cacheControl: {}
			}, {
				supportedQueryTypes: undefined
			}, structuredClone(DEFAULT_META))


			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': 'encode;dur=0',
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': undefined,
				'cache-control': undefined,
				'content-encoding': 'identity',
				'content-length': undefined,
				'content-range': undefined,
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding'
			})

			const result = stream.read()
			assert.deepEqual(result, Buffer.from('TESTING'))
		})

		it('should handle brotli encoding', () => {
			const stream = new MockHttp2Stream()
			const obj = Buffer.from('TESTING')
			Response.encoded(stream, obj, {
				contentType: undefined,
				encoding: 'br',
				age: undefined,
				etag: undefined,
				lastModified: undefined,
				cacheControl: {}
			}, {
				supportedQueryTypes: undefined
			}, structuredClone(DEFAULT_META))


			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'br')

			const result = stream.read()
			const decompressed = zlib.brotliDecompressSync(result)
			assert.deepEqual(decompressed, Buffer.from('TESTING'))
		})
	})
})
