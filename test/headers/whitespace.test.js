import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isWhitespace } from '@johntalton/http-util/util'

describe('Whitespace', () => {
	describe('isWhitespace', () => {
		it('should handle undefined', () => {
			const result = isWhitespace(undefined)
			assert.equal(result, false)
		})

		it('should handle empty string', () => {
			const result = isWhitespace('')
			assert.equal(result, false)
		})

		it('should handle basic space', () => {
			const result = isWhitespace(' ')
			assert.equal(result, true)
		})

		it('should handle mixed ws', () => {
			const result = isWhitespace(' \t\r\n\f ')
			assert.equal(result, true)
		})

		it('should handle not ws', () => {
			const result = isWhitespace('TESTING')
			assert.equal(result, false)
		})
	})
})
