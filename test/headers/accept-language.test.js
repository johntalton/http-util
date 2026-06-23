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

		it('should handle sorting', () => {
			const result = AcceptLanguage.parse('fr;q=.2,en;q=0.5')
			assert.deepEqual(result, [
				{ name: 'en', quality: .5, parameters: new Map([ [ 'q', '0.5'] ]) },
				{ name: 'fr', quality: 0.2, parameters: new Map([ [ 'q', '.2'] ]) }
			])
		})
	})

	describe('selectItemFrom', () => {
		it('should handle undefined', () => {
			const result = AcceptLanguage.selectItemFrom(undefined, undefined)
			assert.equal(result, undefined)
		})

		it('should handle undefined supported', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('foo'), undefined)
			assert.equal(result, undefined)
		})

		it('should select none from empty list', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('foo;q=0.2, bar-BZ'), [])
			assert.equal(result, undefined)
		})

		it('should select none miss-matched list', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('foo, bar'), [ 'biz', 'bang' ])
			assert.equal(result, undefined)
		})

		it('should not return object if first item is undefined', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('bar, *'), [ undefined, 'foo' ])
			assert.deepEqual(result, undefined)
		})

		it('should select from list', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('foo;q=0.2, bar'), [ 'foo' ])
			assert.deepEqual(result, { name: 'foo', quality: .2, parameters: new Map([ [ 'q', '0.2' ] ]) })
		})

		it('should select hightest quality from list (default)', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('foo;q=0.2, bar'), [ 'foo', 'bar' ])
			assert.deepEqual(result, { name: 'bar', quality: 1, parameters: new Map() })
		})

		it('should select hightest quality from list', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('foo;q=0.2, bar;q=.8'), [ 'foo', 'bar' ])
			assert.deepEqual(result, { name: 'bar', quality: .8, parameters: new Map([ [ 'q', '.8' ] ]) })
		})

		it('should select first when any', () => {
			const result = AcceptLanguage.selectItemFrom(AcceptLanguage.parse('*'), [ 'foo', 'bar' ])
			assert.deepEqual(result, { name: 'foo' })
		})
	})
})
