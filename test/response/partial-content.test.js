import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Response } from '@johntalton/http-util/response/object'

import { MockHttp2Stream } from '../mock-http2-stream.js'
import { consumeStreamAsText } from '../consume-stream.js'

/** @import { NonEmptyArray, MultipartBytePart } from '@johntalton/http-util/response' */

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

describe('Response', () => {
	describe('partialContent', () => {
		it('should handle basic values (single object)', () => {
			const stream = new MockHttp2Stream()
			const contentDisposition = undefined
			const contentType = undefined
			const contentLength = undefined
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const digest = undefined
			const obj = {
				obj: 'TEST',
				range: {
					range: { start: 0, end: 42 },
					size: 77
				}
			}
			Response.partialContent(stream, obj, {
				contentDisposition,
				contentType,
				contentLength,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl,
				digest
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 206,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-ranges,content-range',
				'content-type': undefined,
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': 'bytes',
				'cache-control': undefined,
				'content-disposition': undefined,
				'content-encoding': undefined,
				'content-length': undefined,
				'content-range': 'bytes 0-42/77',
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding,range'
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, Buffer.from('TEST'))
		})

		it('should handle basic values (single item array)', () => {
			const stream = new MockHttp2Stream()
			const contentDisposition = undefined
			const contentType = undefined
			const contentLength = undefined
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const digest = undefined

			/** @type {MultipartBytePart} */
			const obj = {
				obj: 'TEST',
				range: {
					range: { start: 0, end: 42 },
					size: 77
				}
			}

			/** @type {[ MultipartBytePart ]} */
			const objs = [obj]

			Response.partialContent(stream, objs, {
				contentType,
				contentDisposition,
				contentLength,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl,
				digest
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 206,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-ranges,content-range',
				'content-type': undefined,
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': 'bytes',
				'cache-control': undefined,
				'content-disposition': undefined,
				'content-encoding': undefined,
				'content-length': undefined,
				'content-range': 'bytes 0-42/77',
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding,range'
			})

			const encoder = new TextEncoder()

			const result = stream.read()
			assert.deepEqual(result, Buffer.from('TEST'))
		})

		it('should handle basic values (multiple item array)', async () => {
			const stream = new MockHttp2Stream()
			const contentDisposition = undefined
			const contentType = undefined
			const contentLength = undefined
			const encoding = undefined
			const etag = undefined
			const lastModified = undefined
			const age = undefined
			const cacheControl = {}
			const digest = undefined

			/** @type {NonEmptyArray<MultipartBytePart>} */
			const objs = [
				{
					obj: 'TEST',
					range: {
						range: { start: 0, end: 42 },
						size: 77
					}
				},
				{
					obj: 'ANOTHER',
					range: {
						range: { start: 76, end: 77 },
						size: 77
					}
				}
			]

			Response.partialContent(stream, objs, {
				contentDisposition,
				contentType,
				contentLength,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl,
				digest
			}, {}, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 206,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-ranges',
				'content-type': 'multipart/byteranges; boundary=PARTIAL_CONTENT_BOUNDARY',
				server: undefined,

				'accept-query': undefined,
				'accept-ranges': 'bytes',
				'cache-control': undefined,
				'content-disposition': undefined,
				'content-encoding': undefined,
				'content-length': undefined,
				'content-range': undefined,
				'last-modified': undefined,
				age: undefined,
				etag: undefined,
				vary: 'accept,accept-encoding'
			})

			const result = await consumeStreamAsText(stream)

			const expected = '--PARTIAL_CONTENT_BOUNDARY\r\n' +
				'content-type: application/octet-stream\r\n' +
				'content-range: bytes 0-42/*\r\n' +
				'\r\n' +
				'TEST\r\n' +
				'--PARTIAL_CONTENT_BOUNDARY\r\n' +
				'content-type: application/octet-stream\r\n' +
				'content-range: bytes 76-77/*\r\n' +
				'\r\n' +
				'ANOTHER\r\n' +
				'--PARTIAL_CONTENT_BOUNDARY--'

			assert.equal(result, expected)

		})
	})
})