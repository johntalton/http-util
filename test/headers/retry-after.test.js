import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { RetryAfter } from '@johntalton/http-util/headers'
import { ifSupports } from '../node-version.js'

describe('RetryAfter', () => {
	describe('encode (seconds)', () => {
		it('should handle undefined', () => {
			const result = RetryAfter.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should support number', () => {
			const result = RetryAfter.encode(42)
			assert.equal(result, '42')
		})

		it('should return handle decimal (round)', () => {
			const result = RetryAfter.encode(3.14)
			assert.equal(result, '3')
		})

		it('should return undefined for invalid number (NaN)', () => {
			const result = RetryAfter.encode(NaN)
			assert.equal(result, undefined)
		})

		it('should support Temporal.Duration', {
			skip: !ifSupports('temporal')
		}, () => {
			const result = RetryAfter.encode(Temporal.Duration.from({ seconds: 42 }))
			assert.equal(result, '42')
		})

		it('should support Temporal.Duration (round)', {
			skip: !ifSupports('temporal')
		}, () => {
			const result = RetryAfter.encode(Temporal.Duration.from({ seconds: 41, milliseconds: 1111 }))
			assert.equal(result, '42')
		})

  })

	describe('encode (time)', () => {
		it('should handle Date', () => {
			const result = RetryAfter.encode(new Date(0))
			assert.equal(result, 'Thu, 01 Jan 1970 00:00:00 GMT')
		})

		it('should support Temporal.Instant', {
			skip: !ifSupports('temporal')
		}, () => {
			const result = RetryAfter.encode(Temporal.Instant.fromEpochMilliseconds(0))
			assert.equal(result, 'Thu, 01 Jan 1970 00:00:00 GMT')
		})
	})
})

