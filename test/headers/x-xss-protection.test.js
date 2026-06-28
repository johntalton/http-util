import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { XSSProtection } from '@johntalton/http-util/headers'

describe('XSSProtection', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = XSSProtection.encode(undefined)
			assert.deepEqual(result, undefined)
		})

		it('should handle default', () => {
			const result = XSSProtection.encode()
			assert.deepEqual(result, undefined)
		})

		it('should handle false', () => {
			const result = XSSProtection.encode(false)
			assert.deepEqual(result, '0')
		})

		it('should handle true', () => {
			assert.throws(() => XSSProtection.encode(true))
		})
	})
})
