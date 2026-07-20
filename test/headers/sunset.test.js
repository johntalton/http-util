import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { Sunset } from '@johntalton/http-util/headers'

describe('Sunset', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = Sunset.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle Temporal Instant', () => {
			const result = Sunset.encode(new Temporal.Instant(0n))
			assert.equal(result, 'Thu, 01 Jan 1970 00:00:00 GMT')
		})

		it('should handle Date', () => {
			const result = Sunset.encode(new Date(1000))
			assert.equal(result, 'Thu, 01 Jan 1970 00:00:01 GMT')
		})
	})
})
