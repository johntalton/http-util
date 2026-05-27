import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { StrictTransportSecurity } from '@johntalton/http-util/headers'

describe('StrictTransportSecurity', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = StrictTransportSecurity.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should throw on missing max-age', () => {
			assert.throws(() => StrictTransportSecurity.encode({}))
		})

		it('should handle simple max-age', () => {
			const result = StrictTransportSecurity.encode({
				maxAge: 42
			})
			assert.equal(result, 'max-age=42')
		})

		it('should handle force max max-age when preload', () => {
			const result = StrictTransportSecurity.encode({
				maxAge: 42,
				preload: true
			})
			assert.equal(result, 'max-age=31536000; preload')
		})

		it('should handle force max max-age when preload', () => {
			const result = StrictTransportSecurity.encode({
				maxAge: 42,
				preload: false,
				includeSubDomains: true
			})
			assert.equal(result, 'max-age=42; includeSubDomains')
		})
	})
})
