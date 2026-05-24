import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Link } from '@johntalton/http-util/headers'


describe('Link', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = Link.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty array', () => {
			const result = Link.encode([])
			assert.equal(result, undefined)
		})

		it('should handle single item', () => {
			const result = Link.encode({
				url: 'http://fake/'
			})
			assert.equal(result, '<http://fake/>')
		})

		it('should handle array of items', () => {
			const result = Link.encode([{
				url: 'http://fake/'
			}])
			assert.equal(result, '<http://fake/>')
		})

		it('should handle url as string', () => {
			const result = Link.encode({
				url: 'http://string/'
			})
			assert.equal(result, '<http://string/>')
		})

		it('should handle url as URL', () => {
			const result = Link.encode({
				url: new URL('http://url/')
			})
			assert.equal(result, '<http://url/>')
		})

		it('should encode url as string', () => {
			const result = Link.encode({
				url: 'http://encoded/with space'
			})
			assert.equal(result, '<http://encoded/with%20space>')
		})

		it('should encode url as URL', () => {
			const result = Link.encode({
				url: new URL('http://encoded/with space')
			})
			assert.equal(result, '<http://encoded/with%20space>')
		})

		it('should handle item with relation', () => {
			const result = Link.encode({
				url: 'http://relation/',
				relation: 'test'
			})
			assert.equal(result, '<http://relation/>; rel="test"')
		})

		it('should handle item with parameters', () => {
			const result = Link.encode({
				url: 'http://param/',
				parameters: new Map([ [ 'this', 'that'] ])
			})
			assert.equal(result, '<http://param/>; this="that"')
		})

		it('should handle array of many', () => {
			const result = Link.encode([
				{ url: 'foo.html', relation: 'foo' },
				{ url: 'bar.html', relation: 'bar' }
			])
			assert.equal(result, '<foo.html>; rel="foo", <bar.html>; rel="bar"')
		})
	})
})

