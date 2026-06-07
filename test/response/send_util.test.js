import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import zlib from 'node:zlib'
import { ReadableStream } from 'node:stream/web'
import { Readable, compose } from 'node:stream'

import { send, send_bytes, send_error, send_encoded } from '@johntalton/http-util/response'

import { consumeStreamAsText } from '../consume-stream.js'
import { MockHttp2Stream } from '../mock-http2-stream.js'

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

// const asRS = buffer => new ReadableStream({ type: 'bytes', start(controller) { controller.enqueue(buffer); controller.close() } })

describe('send_util', () => {
	describe('send', () => {})

	describe('send_bytes', () => {})

	describe('send_error', () => {})

	describe('send_encoded', () => {

		it('should send (string encoded undefined)', async () => {
			const stream = new MockHttp2Stream()
			const body = 'A STRING'
			const encoding = undefined
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], undefined)

			const result = stream.read()
			const encoder = new TextEncoder()
			assert.deepEqual(result, Buffer.from(encoder.encode('A STRING')))
		})

		it('should send (string encoded identity)', async () => {
			const stream = new MockHttp2Stream()
			const body = 'A STRING'
			const encoding = 'identity'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'identity')

			const result = stream.read()
			const encoder = new TextEncoder()
			assert.deepEqual(result, Buffer.from(encoder.encode('A STRING')))
		})

		it('should send (string encoded brotli)', async () => {
			const stream = new MockHttp2Stream()
			const body = 'A STRING'
			const encoding = 'br'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'br')

			const result = stream.read()
			const decompressed = zlib.brotliDecompressSync(result)
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(decompressed)
			assert.equal(decoded, 'A STRING')
		})

		it('should send (Buffer encoded brotli)', async () => {
			const stream = new MockHttp2Stream()
			const body = Buffer.from('A Buffer', 'utf-8')
			const encoding = 'br'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'br')

			const result = stream.read()
			const decompressed = zlib.brotliDecompressSync(result)
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(decompressed)
			assert.equal(decoded, 'A Buffer')
		})

		it('should send (ArrayBuffer encoded brotli)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = encoder.encode('An ArrayBuffer').buffer
			const encoding = 'br'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'br')

			const result = stream.read()
			const decompressed = zlib.brotliDecompressSync(result)
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(decompressed)
			assert.equal(decoded, 'An ArrayBuffer')
		})

		it('should send (Uint8Array encoded zstd)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = encoder.encode('A Uint8Array')
			const encoding = 'zstd'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'zstd')

			const result = stream.read()
			const decompressed = zlib.zstdDecompressSync(result)
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(decompressed)
			assert.equal(decoded, 'A Uint8Array')
		})

		it('should send (ReadableStream<string> encoded identity)', async () => {
			const stream = new MockHttp2Stream()
			const body = ReadableStream.from('A ReadableStream<string>')
			const encoding = 'identity'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'identity')

			const result = await consumeStreamAsText(stream)
			assert.deepEqual(result, 'A ReadableStream<string>')
		})

		it('should send (ReadableStream<Buffer> encoded identity)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = ReadableStream.from([ Buffer.from('A ReadableStream<Buffer>') ])
			const encoding = 'identity'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'identity')

			const result = await consumeStreamAsText(stream)
			assert.deepEqual(result, 'A ReadableStream<Buffer>')
		})

		it('should send (ReadableStream<string> encoded zstd)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = ReadableStream.from('ReadableStream<encoded string>')
			const encoding = 'zstd'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'zstd')

			const composedStream = compose(stream, zlib.createZstdDecompress())
			const result = await consumeStreamAsText(composedStream)

			assert.deepEqual(result, 'ReadableStream<encoded string>')
		})

		it('should send (ReadableStream<Buffer> encoded gzip)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = ReadableStream.from([ Buffer.from('ReadableStream<encoded Buffer>') ])
			const encoding = 'gzip'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'gzip')

			const composedStream = compose(stream, zlib.createGunzip())
			const result = await consumeStreamAsText(composedStream)

			assert.deepEqual(result, 'ReadableStream<encoded Buffer>')
		})

		it('should send (Readable encoded identity)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = Readable.from('Readable string')
			const encoding = 'identity'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'identity')

			const result = await consumeStreamAsText(Readable.toWeb(stream))
			assert.deepEqual(result, 'Readable string')
		})

		it('should send (Readable encoded brotli)', async () => {
			const stream = new MockHttp2Stream()
			const encoder = new TextEncoder()
			const body = Readable.from('Readable brotli string')
			const encoding = 'br'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'br')

			const composedStream = compose(stream, zlib.createBrotliDecompress())
			const result = await consumeStreamAsText(composedStream)

			assert.deepEqual(result, 'Readable brotli string')
		})
	})
})