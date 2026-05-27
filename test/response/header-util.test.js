import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { coreHeaders, customHeaders, performanceHeaders,  } from '@johntalton/http-util/response'

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

describe('Header Util', () => {
	describe('coreHeaders', () => {
		it('should handle basic values', () => {
			const result = coreHeaders(42, 'text/test', [], DEFAULT_META)
			assert.deepEqual(result, {
				':status': 42,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'text/test',
				'server': undefined
			})
		})

		it('should handle basic values with additional exposed headers', () => {
			const result = coreHeaders(42, 'text/test', [
				'fake-header', 'another-one'
			], DEFAULT_META)
			assert.deepEqual(result, {
				':status': 42,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,fake-header,another-one',
				'content-type': 'text/test',
				'server': undefined
			})
		})

	})

	describe('performanceHeaders', () => {
		it('should', () => {
			const meta = {
				...DEFAULT_META,
				performance: [ { name: 'TEST', duration: 42 } ]
			}
			const result = performanceHeaders(meta)
			assert.deepEqual(result, {
				'Timing-Allow-Origin': undefined,
				'Server-Timing': 'TEST;dur=42'
			})
		})

	})

	describe('customHeaders', () => {
		it('should', () => {

		})

	})
})
