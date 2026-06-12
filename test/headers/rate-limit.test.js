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
				remaining: 42,
				//resetSeconds: 0
			})
			assert.equal(result, '"TESTING";r=42')
		})

		it('should handle basic with Zero reset', () => {
			const result = RateLimit.encode({
				name: 'TESTING',
				remaining: 42,
				resetSeconds: 0
			})
			assert.equal(result, '"TESTING";r=42')
		})

		it('should handle basic', () => {
			const result = RateLimit.encode({
				name: 'TESTING',
				remaining: 42,
				resetSeconds: 77
			})
			assert.equal(result, '"TESTING";r=42;t=77')
		})

		it('should handle basic with partition key', () => {
			const result = RateLimit.encode({
				name: 'TESTING',
				remaining: 42,
				resetSeconds: 77,
				partitionKey: 'KEY'
			})
			assert.equal(result, '"TESTING";r=42;t=77;pk=KEY')
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

		it('should handle missing values', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: 42
			})
			assert.equal(result, '"FAKE";q=42')
		})

		it('should handle drop invalid quota values (undefined)', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: undefined,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			})
			assert.equal(result, undefined)
		})

		it('should handle drop invalid quota values (undefined name)', () => {
			const result = RateLimitPolicy.encode({
				name: undefined,
				quota: 42,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			})
			assert.equal(result, undefined)
		})

		it('should handle drop invalid quota values (empty name)', () => {
			const result = RateLimitPolicy.encode({
				name: '',
				quota: 42,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			})
			assert.equal(result, undefined)
		})

		it('should handle drop invalid quota values (NaN)', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: NaN,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			})
			assert.equal(result, undefined)
		})

		it('should handle drop invalid quota values (Infinity)', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: Infinity,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			})
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

		it('should handle common values (with partition key)', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: 42,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000,
				partitionKey: 'KEY'
			})
			assert.equal(result, '"FAKE";q=42;qu="request";w=1000;pk=KEY')
		})

		it('should handle multiple policies', () => {
			const result = RateLimitPolicy.encode({
				name: 'FAKE',
				quota: 42,
				size: 77,
				quotaUnits: 'request',
				windowSeconds: 1000
			}, {
				name: 'MORE_FAKE',
				quota: 1,
				size: 10,
				quotaUnits: 'bytes',
				windowSeconds: 500
			})
			assert.equal(result, '"FAKE";q=42;qu="request";w=1000, "MORE_FAKE";q=1;qu="bytes";w=500')
		})
	})
})