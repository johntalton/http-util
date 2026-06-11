import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Readable } from 'node:stream'

import { requestBody } from '@johntalton/http-util/body'
import { ContentType, MIME_TYPE_MULTIPART_FORM_DATA, MIME_TYPE_URL_FORM_DATA } from '@johntalton/http-util/headers'

describe('Body', () => {
	describe('requestBody', () => {
		it('should handle empty stream', async () => {
			const stream = Readable.from([])
			const options = {}
			const futureBody = requestBody(stream, options)

			assert.equal(await futureBody.text(), '')
		})

		it('should throw if body consumed', async () => {
			const stream = Readable.from([])
			const options = {}
			const futureBody = requestBody(stream, options)

			await futureBody.text()

			assert.rejects(async () => {
				await futureBody.text()
			}, {
				name: 'Error',
				message: 'body already consumed'
			})
		})

		it('should throw on aborted', async () => {
			const stream = Readable.from([ Buffer.from('SOME DATA') ])
			const options = {
				signal: AbortSignal.abort('TESTING')
			}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.text()
			}, {
				name: 'Error',
				message: 'Chunk read Abort Signal (TESTING)'
			})
		})

		it('should throw on aborted (after creation)', async () => {
			const stream = Readable.from([ Buffer.from('SOME DATA') ])
			const controller = new AbortController()
			const options = {
				signal: controller.signal
			}
			const futureBody = requestBody(stream, options)
			const reader = await futureBody.body

			controller.abort('THIS IS AFTER FUTURE BODY')

			assert.rejects(async () => {
				await reader.getReader().read()
			}, {
				name: 'Error',
				message: 'Abort Signal (THIS IS AFTER FUTURE BODY)'
			})
		})

		// it('should throw on closed stream', async () => {
		// 	const stream = Readable.from([ 'SOME DATA' ])
		// 	const controller = new AbortController()
		// 	const options = {}
		// 	const futureBody = requestBody(stream, options)

		// 	stream.destroy()

		// 	// assert.rejects(async () => {
		// 		const result = await futureBody.text()
		// 		assert.equal(result, 'HELLO')
		// 	// 	const reader = await futureBody.body
		// 	// 	await reader.getReader().read()
		// 	// // }, {
		// 	// 	name: 'Error',
		// 	// 	message: 'Abort Signal (THIS IS AFTER FUTURE BODY)'
		// 	// })
		// })

		it('should throw on invalid text charset', async () => {
			const stream = Readable.from([ Buffer.from([ 1,2,3,4 ]) ])
			const options = {
				contentType: {
					name: '',
					mimetype: '',
					type: '',
					subtype: '',
					charset: 'FAKE',
					parameters: new Map()
				}
			}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.text()
			}, {
				name: 'RangeError',
				message: 'The "FAKE" encoding is not supported'
			})
		})

		it('should throw on invalid text bytes (non-utf8)', async () => {
			const stream = Readable.from([ Buffer.from([ 0xFF ]) ])
			const options = {}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.text()
			}, {
				name: 'TypeError',
				message: 'The encoded data was not valid for encoding utf-8'
			})
		})

		it('should throw on byte limit exceeded', async () => {
			const stream = Readable.from([ Buffer.from('A STRING MORE THEN BYTE LIMIT LONG') ])
			const options = {
				byteLimit: 20
			}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.text()
			}, {
				name: 'Error',
				message: 'body exceed byte limit'
			})
		})

		it('should throw on stream not a TypedArray', async () => {
			const stream = Readable.from([ 'A STRING IS NOT A BUFFER' ])
			const options = {
				byteLimit: 20
			}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.text()
			}, {
				name: 'Error',
				message: 'invalid chunk type'
			})
		})

		it('should handle zero content length (text)', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {
				contentLength: 0
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.text()
			assert.equal(result, '')
		})

		it('should handle zero content length (arrayBuffer)', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {
				contentLength: 0
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.arrayBuffer()
			assert.ok(result instanceof ArrayBuffer)
			assert.deepEqual(result, new ArrayBuffer(0))
		})

		it('should handle reading blob', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.blob()
			assert.ok(result instanceof Blob)
			assert.equal(result.type, '')
		})

		it('should handle reading blob (content type from options)', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {
				contentType: {
					mimetype: 'text/plain'
				}
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.blob()
			assert.ok(result instanceof Blob)
			assert.equal(result.type, 'text/plain')
		})

		it('should handle reading blob (content type from parameter)', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.blob('text/plain')
			assert.ok(result instanceof Blob)
			assert.equal(result.type, 'text/plain')
		})

		it('should handle reading arrayBuffer', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.arrayBuffer()
			assert.ok(result instanceof ArrayBuffer)
		})

		it('should handle reading bytes', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.bytes()
			assert.ok(result instanceof Uint8Array)
		})

		it('should handle reading text', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.text()
			assert.ok(typeof result === 'string')
		})

		it('should handle reading json (empty string)', async () => {
			const stream = Readable.from([ Buffer.from('') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.json()
			assert.deepEqual(result, { })
		})

		it('should handle reading json', async () => {
			// const stream = Readable.from([ Buffer.from('{ "test": true}') ])
			const stream = Readable.from([ Buffer.from(JSON.stringify({ test: true })) ])
			const options = {}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.json()
			assert.deepEqual(result, { test: true })
		})


		it('should throw error on FordData unknown content type ', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.formData()
			}, {
				name: 'Error',
				message: 'undefined content type for form data'
			})
		})

		it('should throw error on FordData invalid content type ', async () => {
			const stream = Readable.from([ Buffer.from('A TEST') ])
			const options = {
				contentType: {
					name: 'text/plain',
					mimetype: 'text/plain',
					type: 'text',
					subtype: 'plain',
					parameters: new Map()
				}
			}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.formData()
			}, {
				name: 'TypeError',
				message: 'unknown mime type for form data'
			})
		})

		it('should handle reading formData (URL empty)', async () => {
			const stream = Readable.from([ Buffer.from('') ])
			const options = {
				contentType: ContentType.parse(MIME_TYPE_URL_FORM_DATA)
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.formData()
			assert.ok(result instanceof FormData)
			assert.equal([ ...result.keys() ].length, 0)
		})

		it('should handle reading formData (URL single key)', async () => {
			const stream = Readable.from([ Buffer.from('KEY') ])
			const options = {
				contentType: ContentType.parse(MIME_TYPE_URL_FORM_DATA)
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.formData()
			assert.ok(result instanceof FormData)
			assert.equal([ ...result.keys() ].length, 1)
			assert.ok(result.has('KEY'))
			assert.equal(result.get('KEY'), '')
		})

		it('should handle reading formData (URL multiple)', async () => {
			const stream = Readable.from([ Buffer.from('KEY1=foo&KEY1=bar&KEY2=biz') ])
			const options = {
				contentType: ContentType.parse(MIME_TYPE_URL_FORM_DATA)
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.formData()
			assert.ok(result instanceof FormData)
			assert.equal([ ...result.keys() ].length, 3)
			assert.ok(result.has('KEY1'))
			assert.ok(result.has('KEY2'))
			assert.equal(result.get('KEY1'), 'foo')
			assert.deepEqual(result.getAll('KEY1'), [ 'foo', 'bar' ])
			assert.equal(result.get('KEY2'), 'biz')
		})

		it('should throw on missing Multipart Boundary', async () => {
			const stream = Readable.from([ Buffer.from('') ])
			const options = {
				contentType: ContentType.parse(`${MIME_TYPE_MULTIPART_FORM_DATA}`)
			}
			const futureBody = requestBody(stream, options)

			assert.rejects(async () => {
				await futureBody.formData()
			}, {
				name: 'Error',
				message: 'unspecified boundary'
			})

		})

		it('should handle reading formData (Multipart empty)', async () => {
			const stream = Readable.from([ Buffer.from('') ])
			const options = {
				contentType: ContentType.parse(`${MIME_TYPE_MULTIPART_FORM_DATA};boundary="BBB"`)
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.formData()
			assert.ok(result instanceof FormData)
		})

		it('should handle reading formData (Multipart simple)', async () => {
			const stream = Readable.from([ Buffer.from('--BBB\r\ncontent-disposition: form-data;name="TEST"\r\n\r\nTESTING\r\n--BBB--') ])
			const options = {
				contentType: ContentType.parse(`${MIME_TYPE_MULTIPART_FORM_DATA};boundary="BBB"`)
			}
			const futureBody = requestBody(stream, options)

			const result = await futureBody.formData()
			assert.ok(result instanceof FormData)
			assert.equal(result.get('TEST'), 'TESTING')
		})

	})
})