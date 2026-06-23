import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
	coreHeaders,
	customHeaders,
	performanceHeaders,
	coerceSupportedTypes
} from '@johntalton/http-util/response'

/** @import { Metadata } from '@johntalton/http-util/response' */

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

describe('Header Util', () => {
	describe('coreHeaders', () => {
		it('should handle basic values', () => {
			const result = coreHeaders(42, 'text/test', [], structuredClone(DEFAULT_META))
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
			], structuredClone(DEFAULT_META))
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
		it('should allow undefined', () => {
			const meta = {
				...DEFAULT_META,
				customHeaders: undefined
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should allow empty array', () => {
			const meta = {
				...DEFAULT_META,
				customHeaders: []
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should filter non X- headers', () => {
			/** @type {Metadata} */
			const meta = {
				...DEFAULT_META,
				// @ts-ignore
				customHeaders: [ [ 'FOO', 'BAR' ]  ]
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should filter non x- headers', () => {
			/** @type {Metadata} */
			const meta = {
				...DEFAULT_META,
				// @ts-ignore
				customHeaders: [ [ 'x-FOO', 'BAR' ]  ]
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should output valid headers', () => {
			/** @type {Metadata} */
			const meta = {
				...DEFAULT_META,
				customHeaders: [ [ 'X-FOO', 'BAR' ]  ]
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, {
				'X-FOO': 'BAR'
			})
		})

	})

	describe('coerceSupportedTypes', () => {
		it('should handle undefined supportedTypes', () => {
			const result = coerceSupportedTypes('VERB', undefined)
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle undefined methods', () => {
			const result = coerceSupportedTypes(undefined, 'TYPE')
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle methods empty array', () => {
			const result = coerceSupportedTypes([], 'TYPE')
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle methods array', () => {
			const result = coerceSupportedTypes(['PUT'], 'TYPE')
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: undefined,
				patch: undefined
			})
		})

		it('should handle supportedTypes empty array', () => {
			const result = coerceSupportedTypes('PUT', [])
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle supportedTypes array', () => {
			const result = coerceSupportedTypes('PUT', [ 'TYPE' ])
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: undefined,
				patch: undefined
			})
		})

		it('should handle methods array of many (no patch)', () => {
			const result = coerceSupportedTypes(['PUT', 'POST', 'QUERY'], 'TYPE')
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: [ 'TYPE' ],
				patch: undefined
			})
		})

		it('should handle methods array of many (with patch)', () => {
			const result = coerceSupportedTypes(['PUT', 'POST', 'PATCH'], 'TYPE')
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: [ 'TYPE' ],
				patch: [ 'TYPE' ]
			})
		})

		it('should handle supportedTypes array of many', () => {
			const result = coerceSupportedTypes('PUT', ['TYPE/A', 'TYPE/B'])
			assert.deepEqual(result, {
				put: [ 'TYPE/A', 'TYPE/B' ],
				post: undefined,
				patch: undefined
			})
		})

		it('should handle supportedTypes Object', () => {
			const result = coerceSupportedTypes(['PUT', 'POST'], {
				put: 'TYPE/A',
				patch: 'TYPE/B'
			})
			assert.deepEqual(result, {
				put: [ 'TYPE/A' ],
				post: undefined,
				patch: [ 'TYPE/B' ]
			})
		})
	})
})
