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
      const acceptableMediaType = [ 'text/plain' ]
      const supportedQueryTypes = undefined
			Response.unsupportedMediaType(stream, acceptableMediaType, supportedQueryTypes, DEFAULT_META)

			assert.equal(stream.headersSent, true)
			assert.deepEqual(stream.sentHeaders, {
				':status': 415,
				'Server-Timing': undefined,
				'Timing-Allow-Origin': undefined,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,accept-post',
				'content-type': undefined,

        'accept-post': 'text/plain',
        'accept-query': undefined,
				server: undefined
			})

			const result = stream.read()
			assert.deepEqual(result, null)
		})
	})
})
