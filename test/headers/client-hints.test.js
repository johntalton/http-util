import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ClientHints } from '@johntalton/http-util/headers'

describe('ClientHints', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ClientHints.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty array', () => {
			const result = ClientHints.encode([])
			assert.equal(result, undefined)
		})

		it('should reject non-array', () => {
			const result = ClientHints.encode('TESTING')
			assert.equal(result, undefined)
		})

		it('should reject unknown hints', () => {
			const result = ClientHints.encode([ 'FAKE' ])
			assert.equal(result, undefined)
		})

		it('should handle common values', () => {
			const result = ClientHints.encode([ 'Sec-CH-UA', 'Sec-CH-UA-Mobile' ])
			assert.equal(result, 'Sec-CH-UA, Sec-CH-UA-Mobile')
		})
	})
})
