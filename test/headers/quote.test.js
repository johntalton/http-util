import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isQuoted, stripQuotes } from '@johntalton/http-util/util'

describe('Quote', () => {
	describe('isQuoted', () => {
		it('should handle undefined', () => {
			const result = isQuoted(undefined)
			assert.equal(result, false)
		})

		it('should handle minimum length of quote (single quote)', () => {
			const result = isQuoted('"')
			assert.equal(result, false)
		})

		it('should handle missing trailing quote', () => {
			const result = isQuoted('"SOME UNBALANCED STRING')
			assert.equal(result, false)
		})

		it('should handle quoted (empty)', () => {
			const result = isQuoted('""')
			assert.equal(result, true)
		})

		it('should handle quoted', () => {
			const result = isQuoted('"SOME STRING"')
			assert.equal(result, true)
		})
	})

	describe('stripQuotes', () => {
		it('should handle undefined', () => {
			const result = stripQuotes(undefined)
			assert.equal(result, undefined)
		})

		it('should handle quoted', () => {
			const result = stripQuotes('"SOME STRING"')
			assert.equal(result, 'SOME STRING')
		})
	})
})
