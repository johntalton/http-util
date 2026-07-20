import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { Deprecation } from '@johntalton/http-util/headers'

describe('Deprecation', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = Deprecation.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle Temporal Instant', () => {
			const result = Deprecation.encode(new Temporal.Instant(0n))
			assert.equal(result, '@0')
		})

	})
})
