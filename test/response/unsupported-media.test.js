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
	describe('unsupportedMedia', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = ['text/plain']
			const supportedQueryTypes = undefined
			const method = 'POST'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-post',
				'content-type': undefined,

				'accept-patch': undefined,
				'accept-post': 'text/plain',
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (acceptable media singular string)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = 'text/plain'
			const supportedQueryTypes = undefined
			const method = 'POST'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-post',
				'content-type': undefined,

				'accept-patch': undefined,
				'accept-post': 'text/plain',
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (supported query type)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = ['text/plain']
			const supportedQueryTypes = ['application/sql']
			const method = 'POST'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-query,accept-post',
				'content-type': undefined,

				'accept-patch': undefined,
				'accept-post': 'text/plain',
				'accept-query': 'application/sql',
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (PATCH method)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = ['text/plain']
			const supportedQueryTypes = undefined
			const method = 'PATCH'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-patch',
				'content-type': undefined,

				'accept-patch': 'text/plain',
				'accept-post': undefined,
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (PUT method)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = ['text/plain']
			const supportedQueryTypes = undefined
			const method = 'PUT'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,

				'accept-patch': undefined,
				'accept-post': undefined,
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (structured supportedTypes undefined)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = undefined
			const supportedQueryTypes = undefined
			const method = 'PATCH'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': undefined,

				'accept-patch': undefined,
				'accept-post': undefined,
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (structured supportedTypes patch string)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = {
				patch: 'application/xml'
			}
			const supportedQueryTypes = undefined
			const method = 'PATCH'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-patch',
				'content-type': undefined,

				'accept-patch': 'application/xml',
				'accept-post': undefined,
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (structured supportedTypes patch array)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = {
				patch: [ 'application/xml', 'application/json' ]
			}
			const supportedQueryTypes = undefined
			const method = 'PATCH'
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-patch',
				'content-type': undefined,

				'accept-patch': 'application/xml,application/json',
				'accept-post': undefined,
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values (method undefined with structured supportedTypes post and patch array)', () => {
			const stream = new MockHttp2Stream()
			const supportedTypes = {
				patch: [ 'application/xml', 'application/json' ],
				post: 'text/plain'
			}
			const supportedQueryTypes = undefined
			const method = undefined
			Response.unsupportedMediaType(stream, method, {
				supportedTypes,
				supportedQueryTypes
			}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-post,accept-patch',
				'content-type': undefined,

				'accept-patch': 'application/xml,application/json',
				'accept-post': 'text/plain',
				'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

	})
})
