import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { AcceptLanguage } from '@johntalton/http-util/headers'

describe('AcceptLanguage', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = AcceptLanguage.parse(undefined)
			assert.deepEqual(result, [])
		})

		it('should handle empty string', () => {
			const result = AcceptLanguage.parse('')
			assert.deepEqual(result, [])
		})

		it('should handle well known', () => {
			const result = AcceptLanguage.parse('en-US,en;q=0.5')
			assert.deepEqual(result, [
				{ name: 'en-US', quality: 1 }, { name: 'en', quality: 0.5 }
			])
		})
	})

	describe('select', () => {
		it('should handle undefined', () => {
			const result = AcceptLanguage.select(undefined, undefined)
			assert.equal(result, undefined)
		})

		it('should handle undefined supported', () => {
			const result = AcceptLanguage.select('', undefined)
			assert.equal(result, undefined)
		})

		it('should select none from empty list', () => {
			const result = AcceptLanguage.select('foo;q=0.2, bar-BZ', [])
			assert.equal(result, undefined)
		})

		it('should select from list', () => {
			const result = AcceptLanguage.select('foo;q=0.2, bar', [ 'foo' ])
			assert.equal(result, 'foo')
		})

		it('should select hightest quality from list (default)', () => {
			const result = AcceptLanguage.select('foo;q=0.2, bar', [ 'foo', 'bar' ])
			assert.equal(result, 'bar')
		})

		it('should select hightest quality from list', () => {
			const result = AcceptLanguage.select('foo;q=0.2, bar;q=.8', [ 'foo', 'bar' ])
			assert.equal(result, 'bar')
		})

		it('should select first when any', () => {
			const result = AcceptLanguage.select('*', [ 'foo', 'bar' ])
			assert.equal(result, 'foo')
		})
	})
})
