import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import zlib from 'node:zlib'
import { ReadableStream } from 'node:stream/web'
import { Readable, compose } from 'node:stream'

import { send, send_bytes, send_no_body, send_error, send_encoded } from '@johntalton/http-util/response'

import { consumeStreamAsText } from '../consume-stream.js'
import { MockHttp2Stream } from '../mock-http2-stream.js'

const DEFAULT_META = {
	performance: [],
	servername: 'TEST-SERVER-v1',
	origin: undefined
}

// const asRS = buffer => new ReadableStream({ type: 'bytes', start(controller) { controller.enqueue(buffer); controller.close() } })

describe('send_util', () => {
	describe('send_no_body', () => {
		it('should send with no body', () => {
			const stream = new MockHttp2Stream()
			const message = undefined
			send_no_body(stream, 200, {}, [], structuredClone(DEFAULT_META))

			assert.equal(stream.sentHeaders[':status'], 200)
			assert.equal(stream.sentHeaders['server'], 'TEST-SERVER-v1')

			const result = stream.read()
			assert.equal(result, null)
		})
	})

	describe('send_error', () => {
		it('should send with default message', () => {
			const stream = new MockHttp2Stream()
			const message = undefined
			send_error(stream, 500, message, undefined, structuredClone(DEFAULT_META))

			const result = stream.read()
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(result)
			assert.equal(decoded, JSON.stringify({ message: 'Error' }))
		})

		it('should send with message', () => {
			const stream = new MockHttp2Stream()
			const message = 'A Message'
			send_error(stream, 500, message, undefined, structuredClone(DEFAULT_META))

			const result = stream.read()
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(result)
			assert.equal(decoded, JSON.stringify({ message }))
		})

		it('should send with message and retryAfter', () => {
			const stream = new MockHttp2Stream()
			const message = 'A Message'
			const retryAfter = 42
			send_error(stream, 500, message, retryAfter, structuredClone(DEFAULT_META))

			assert.equal(stream.sentHeaders[':status'], 500)
			assert.equal(stream.sentHeaders['retry-after'], '42')
			assert.equal(stream.sentHeaders['access-control-expose-headers'], 'etag,server,retry-after')

			const result = stream.read()
			const decoder = new TextDecoder('utf-8')
			const decoded = decoder.decode(result)
			assert.equal(decoded, JSON.stringify({ message }))
		})
	})

	describe('send_encoded', () => {
		it('should send empty body with encoding', async () => {
			const stream = new MockHttp2Stream()
			const body = undefined
			const encoding = 'br'
			send_encoded(stream, 200, undefined, body, encoding, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-encoding'], 'br')

			const result = stream.read()
			assert.equal(result, null)
		})

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

	describe('send_bytes', () => {
		it('should ignore invalid contentLength', () => {
			const stream = new MockHttp2Stream()
			const body = 'TEST'
			const contentLength = NaN
			send_bytes(stream, 200, 'application/json', body, undefined, contentLength, undefined, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-length'], undefined)
		})

		it('should ignore valid contentLength', () => {
			const stream = new MockHttp2Stream()
			const body = 'TEST'
			const contentLength = body.length
			send_bytes(stream, 200, 'application/json', body, undefined, contentLength, undefined, undefined, undefined, undefined, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-length'], '4')
		})

		it('should ignore valid supportQueryTypes', () => {
			const stream = new MockHttp2Stream()
			const body = 'TEST'
			const supportedQueryTypes = [ 'text/plain', 'application/json' ]
			send_bytes(stream, 200, 'application/json', body, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, supportedQueryTypes, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['content-length'], undefined)
			assert.equal(stream.sentHeaders['accept-query'], 'text/plain,application/json')
		})

		it('should ignore valid age', () => {
			const stream = new MockHttp2Stream()
			const body = 'TEST'
			const age = 42
			send_bytes(stream, 200, 'application/json', body, undefined, undefined, undefined, undefined, undefined, age, undefined, undefined, undefined, structuredClone(DEFAULT_META))

			assert.equal(stream.headersSent, true)
			assert.equal(stream.sentHeaders['age'], '42')
		})
	})

	describe('send', () => {
		it('should return without sending if stream is undefined', () => {
			const stream = undefined
			assert.doesNotThrow(() => {
				send(stream, 200, {}, [], undefined, undefined, structuredClone(DEFAULT_META))
			})
		})

		it('should return without sending if stream is closed', () => {
			const stream = new MockHttp2Stream()
			stream.close('induced')

			const obj = 'NEVER SENT'
			send(stream, 200, {}, [], undefined, obj, structuredClone(DEFAULT_META))
			assert.deepEqual(stream.sentHeaders, {})
			assert.equal(stream.closed, true)

			const result = stream.read()
			assert.equal(result, null)
		})

		it('should swallow on pipeline error', () => {
			const stream = new MockHttp2Stream()
			const obj = new ReadableStream({
				pull() { throw new Error('induced') }
			})

			send(stream, 200, {}, [], undefined, obj, structuredClone(DEFAULT_META))

			// todo what can we assert to make sure that happend
			//  does the source stream get closed? or aborted?
			// assert.equal(stream.aborted, true)
			// assert.equal(stream.closed, true)

		})

	})
})