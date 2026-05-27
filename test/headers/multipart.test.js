import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Multipart } from '@johntalton/http-util/headers'

import { consumeStreamAsText } from '../consume-stream.js'

const EXAMPLE_MULTIPART_TEXT = [
	"--BOUNDARY",
	"Content-Disposition: form-data;name=\"TEST\"",
	"Content-Type: application/octet-stream",
	"Content-Range: 0-0/4",
	"",
	"HI",
	"--BOUNDARY--"
].join('\r\n')

const EXAMPLE_MULTIPART_MULTI_TEXT = [
	"--BOUNDARY",
	"Content-Disposition: form-data;name=\"TEST\"",
	"Content-Type: application/octet-stream",
	"Content-Range: 0-0/4",
	"",
	"HI",
	"--BOUNDARY",
	"Content-Disposition: form-data;name=\"AGAIN\"",
	"Content-Type: application/octet-stream",
	"",
	"HELLO THEIR",
	"--BOUNDARY--"
].join('\r\n')


describe('Multipart', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Multipart.parse(undefined, undefined)
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 0)
		})

		it('should handle undefined boundary', () => {
			const result = Multipart.parse('', undefined)
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 0)
		})

		it('should handle empty string', () => {
			const result = Multipart.parse('', '')
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 0)
		})

		// it('should handle string with no line endings', () => {
		// 	const result = Multipart.parse('TESTING', 'BOUNDARY')
		// 	assert.ok(result instanceof FormData)
		//	assert.equal([...result.entries()].length, 0)
		// })

		it('should handle simplified string', () => {
			const result = Multipart.parse('--BOUNDARY\r\n', 'BOUNDARY')
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 0)
		})

		it('should handle end boundary at start', () => {
			const result = Multipart.parse('--BOUNDARY--\r\n', 'BOUNDARY')
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 0)
		})

		it('should handle common data', () => {
			const result = Multipart.parse(EXAMPLE_MULTIPART_TEXT, 'BOUNDARY')
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 1)
			assert.deepEqual([...result.keys()], ['TEST'])
			assert.equal(result.get('TEST'), 'HI')
		})

		it('should handle multi common data', () => {
			const result = Multipart.parse(EXAMPLE_MULTIPART_MULTI_TEXT, 'BOUNDARY')
			assert.ok(result instanceof FormData)
			assert.equal([...result.entries()].length, 2)
			assert.deepEqual([...result.keys()], ['TEST', 'AGAIN'])
			assert.equal(result.get('TEST'), 'HI')
			assert.equal(result.get('AGAIN'), 'HELLO THEIR')
		})

	})

	describe('encode_Bytes', () => {
		it('should handle undefined', () => {
			const stream = Multipart.encode_Bytes(undefined, undefined, undefined, undefined)
			assert.ok(stream instanceof ReadableStream)
		})

		it('should handle string object', async () => {
			const stream = Multipart.encode_Bytes('text/plain', [ { obj: 'TESTING', range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)

			const result = await consumeStreamAsText(stream)
			assert.equal(result, '--BOUNDARY\r\ncontent-type: text/plain\r\ncontent-range: bytes */*\r\n\r\nTESTING\r\n--BOUNDARY--')
		})

		it('should handle Uint8Array object', async () => {
			const encoder = new TextEncoder()
			const obj = encoder.encode('TESTING')
			const stream = Multipart.encode_Bytes('text/plain', [ { obj, range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)

			const result = await consumeStreamAsText(stream)
			assert.equal(result, '--BOUNDARY\r\ncontent-type: text/plain\r\ncontent-range: bytes */*\r\n\r\nTESTING\r\n--BOUNDARY--')
		})

		it('should handle ArrayBuffer object', async () => {
			const encoder = new TextEncoder()
			const obj = encoder.encode('TESTING').buffer
			const stream = Multipart.encode_Bytes('text/plain', [ { obj, range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)

			const result = await consumeStreamAsText(stream)
			assert.equal(result, '--BOUNDARY\r\ncontent-type: text/plain\r\ncontent-range: bytes */*\r\n\r\nTESTING\r\n--BOUNDARY--')
		})

		it('should handle ReadableStream of string object', async () => {
			function* gen() { yield 'TESTING' }
			const obj = ReadableStream.from(gen())
			const stream = Multipart.encode_Bytes('text/plain', [ { obj, range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)

			const result = await consumeStreamAsText(stream)
			assert.equal(result, '--BOUNDARY\r\ncontent-type: text/plain\r\ncontent-range: bytes */*\r\n\r\nTESTING\r\n--BOUNDARY--')
		})

		it('should handle ReadableStream of char object', async () => {
			function* gen() {
				yield 84
				yield 69
				yield 83
				yield 84
			}
			const obj = ReadableStream.from(gen())
			const stream = Multipart.encode_Bytes('text/plain', [ { obj, range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)

			const result = await consumeStreamAsText(stream)
			assert.equal(result, '--BOUNDARY\r\ncontent-type: text/plain\r\ncontent-range: bytes */*\r\n\r\nTEST\r\n--BOUNDARY--')
		})

		it('should handle ReadableStream of ArrayBuffer object', async () => {
			const encoder = new TextEncoder()
			const encodedText = encoder.encode('TESTING')
			const obj = ReadableStream.from([ encodedText ])
			const stream = Multipart.encode_Bytes('text/plain', [ { obj, range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)

			const result = await consumeStreamAsText(stream)
			assert.equal(result, '--BOUNDARY\r\ncontent-type: text/plain\r\ncontent-range: bytes */*\r\n\r\nTESTING\r\n--BOUNDARY--')
		})

		it('should error on unknown part type', async () => {
			const obj = 42
			const stream = Multipart.encode_Bytes('text/plain', [ { obj, range: {} } ], undefined, 'BOUNDARY')
			assert.ok(stream instanceof ReadableStream)
			assert.rejects(() => stream.getReader().read())
		})
	})
})
