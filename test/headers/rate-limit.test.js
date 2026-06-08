import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { RateLimit, RateLimitPolicy } from '@johntalton/http-util/headers'

describe('RateLimit', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = RateLimit.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should reject missing name', () => {
			const result = RateLimit.encode({ })
			assert.equal(result, undefined)
		})

		it('should reject missing remaining', () => {
			const result = RateLimit.encode({ name: 'TESTING' })
			assert.equal(result, undefined)
		})

		it('should handle basic with missing reset', () => {
			const result = RateLimit.encode({
				name: 'TESTING',
				remaining: 42
			})
			assert.equal(result, '"TESTING";r=42')
		})

		it('should handle basic with', () => {
			const result = RateLimit.encode({
				name: 'TESTING',
				remaining: 42,
				resetSeconds: 77
			})
			assert.equal(result, '"TESTING";r=42;t=77')
		})


	})
})

describe('RateLimitPolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = RateLimitPolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty parameters', () => {
			const result = RateLimitPolicy.encode()
			assert.equal(result, undefined)
		})

		it('should handle common values', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: 42,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			})
			assert.equal(result, '"FAKE";q=42;qu="request";w=1000')
		})
	})
})