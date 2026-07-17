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
	describe('preflight', () => {
		it('should handle basic values', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'TEST', 'FAKE', 'QUERY' ]
			const supportedQueryTypes = [ 'text/sql' ]
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: []
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-query',
				'content-type': undefined,
				server: undefined,

				'accept-post': undefined,
				'accept-patch': undefined,
				'accept-query': 'text/sql',
				'accept-ranges': undefined,
				'access-control-allow-methods': 'TEST,FAKE,QUERY',
				'access-control-allow-headers': 'if-match,if-none-match,authorization,content-type,range,if-range',
				'access-control-max-age': '500'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle basic values alt', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'TEST', 'QUERY' ]
			const supportedQueryTypes = [ 'text/sql' ]
			const acceptRanges = 'bytes'

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: []
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 200,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-ranges,accept-query',
				'content-type': undefined,
				server: undefined,

				'accept-post': undefined,
				'accept-patch': undefined,
				'accept-query': 'text/sql',
				'accept-ranges': 'bytes',
				'access-control-allow-methods': 'TEST,QUERY',
				'access-control-allow-headers': 'if-match,if-none-match,authorization,content-type,range,if-range',
				'access-control-max-age': '500'
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})

		it('should handle supported types (string all methods)', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'POST', 'PATCH' ]
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: 'text/plain'
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['accept-post'], 'text/plain')
			assert.equal(stream.sentHeaders['accept-patch'], 'text/plain')
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server,accept-post,accept-patch')
		})

		it('should handle supported types (string only patch)', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'GET', 'PATCH' ]
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: 'text/plain'
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['accept-post'], undefined)
			assert.equal(stream.sentHeaders['accept-patch'], 'text/plain')
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server,accept-patch')
		})

		it('should handle supported types (array only patch)', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'GET', 'PATCH' ]
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: [ 'text/plain' ]
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['accept-post'], undefined)
			assert.equal(stream.sentHeaders['accept-patch'], 'text/plain')
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server,accept-patch')
		})

		it('should handle supported types (multi-array only patch)', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'GET', 'PATCH' ]
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: [ 'text/plain', 'application/json' ]
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['accept-post'], undefined)
			assert.equal(stream.sentHeaders['accept-patch'], 'text/plain,application/json')
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server,accept-patch')
		})

		it('should handle supported types (string no methods)', () => {
			const stream = new MockHttp2Stream()
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods: [],
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: [ 'text/plain' ]
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['accept-post'], undefined)
			assert.equal(stream.sentHeaders['accept-patch'], undefined)
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server')
		})

		it('should handle supported types (structured only patch ignore method)', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'PATCH' ]
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: undefined,
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: {
					put: undefined,
					patch: 'text/plain',
					post: 'application/json'
				}
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['accept-post'], 'application/json')
			assert.equal(stream.sentHeaders['accept-patch'], 'text/plain')
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server,accept-post,accept-patch')
		})

		it('should add additional supported headers', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'GET' ]
			const supportedQueryTypes = undefined
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: [ 'X-Fake' ],
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: []
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['access-control-allow-headers'], 'if-match,if-none-match,authorization,content-type,range,if-range,X-Fake')

		})

		it('should drop supported query when method not listed', () => {
			const stream = new MockHttp2Stream()
			const supportedMethods = [ 'NOT_QUERY' ]
			const supportedQueryTypes = [ 'text/plain']
			const acceptRanges = undefined

			Response.preflight(stream, {
				supportedMethods,
				supportedHeaders: [ ],
				supportedQueryTypes,
				acceptRanges,
				supportedTypes: []
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server')
			assert.equal(stream.sentHeaders['accept-query'], undefined)


		})

	})
})
