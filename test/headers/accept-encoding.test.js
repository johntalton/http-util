import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { AcceptEncoding } from '@johntalton/http-util/headers'

describe('AcceptEncoding', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = AcceptEncoding.parse(undefined)
			assert.deepEqual(result, [])
		})

		it('should parse well-known', () => {
			const result = AcceptEncoding.parse('gzip, deflate, br, zstd')
			assert.deepEqual(result, [
				{ name: 'gzip' },
				{ name: 'deflate' },
				{ name: 'br' },
				{ name: 'zstd' }
			])
		})

		it('should parse custom', () => {
			const result = AcceptEncoding.parse('foo, bar')
			assert.deepEqual(result, [
				{ name: 'foo', quality: 1, parameters: new Map() },
				{ name: 'bar', quality: 1, parameters: new Map() }
			])
		})

		it('should parse any', () => {
			const result = AcceptEncoding.parse('*')
			assert.deepEqual(result, [
				{ name: '*', quality: 1, parameters: new Map() }
			])
		})
	})

	describe('selectItemFrom', () => {
		it('should handle undefined', () => {
			const result = AcceptEncoding.selectItemFrom(undefined, undefined)
			assert.equal(result, undefined)
		})

		it('should handle non-array', () => {
			const result = AcceptEncoding.selectItemFrom('TEST', [])
			assert.equal(result, undefined)
		})

		it('should handle empty array', () => {
			const result = AcceptEncoding.selectItemFrom([], [])
			assert.equal(result, undefined)
		})

		it('should handle array of undefined', () => {
			const result = AcceptEncoding.selectItemFrom([ undefined ], [ 'fake' ])
			assert.equal(result, undefined)
		})

		it('should handle array of name undefined', () => {
			const result = AcceptEncoding.selectItemFrom([ {
				name: undefined
			}], [ '*' ])
			assert.equal(result, undefined)
		})

		it('should handle array of name undefined', () => {
			const result = AcceptEncoding.selectItemFrom([ {
				name: '*'
			}], [ undefined ])
			assert.equal(result, undefined)
		})

		it('should handle undefined supported', () => {
			const result = AcceptEncoding.selectItemFrom([ {
				name: 'FAKE'
			} ], undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty supported', () => {
			const result = AcceptEncoding.selectItemFrom([ { name: 'gzip' }, { name: 'zstd'} ], [])
			assert.equal(result, undefined)
		})

		it('should handle selecting first', () => {
			const result = AcceptEncoding.selectItemFrom([
				{
					name: 'gzip'
				},
				{
					name: 'zstd'
				}
			],
			[ 'gzip', 'zstd' ])
			assert.deepEqual(result, { name: 'gzip' })
		})

		it('should handle selecting with quality', () => {
			const result = AcceptEncoding.selectItemFrom([
				{
					name: 'br',
					quality: 1.0
				},
				{
					name: 'gzip',
					quality: .8
				},
				{
					name: '*',
					quality: .1
				}
			],
			[ 'gzip', 'fake' ])
			assert.deepEqual(result, { name: 'gzip', quality: 0.8 })
		})

		it('should handle selecting any as fallback', () => {
			const result = AcceptEncoding.selectItemFrom([
				{
					name: 'br',
					quality: 1.0
				},
				{
					name: 'gzip',
					quality: .8
				},
				{
					name: '*',
					quality: .1
				}
			], [ 'fake' ])
			assert.deepEqual(result, { name: 'fake' })
		})

		it('should handle selecting any', () => {
			const result = AcceptEncoding.selectItemFrom([
				{
					name: '*',
					quality: 0.1
				}
			], [ 'gzip', 'deflate' ])
			assert.deepEqual(result, { name: 'gzip' })
		})
	})

	describe('select', () => {
		it('should handle undefined', () => {
			const result = AcceptEncoding.select(undefined, undefined)
			assert.equal(result, undefined)
		})

		it('should handle undefined supported', () => {
			const result = AcceptEncoding.select('', undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty supported', () => {
			const result = AcceptEncoding.select('gzip, zstd', [])
			assert.equal(result, undefined)
		})

		it('should handle selecting first', () => {
			const result = AcceptEncoding.select('gzip, zstd', [ 'gzip', 'zstd' ])
			assert.equal(result, 'gzip')
		})

		it('should handle selecting with quality', () => {
			const result = AcceptEncoding.select('br;q=1.0, gzip;q=0.8, *;q=0.1', [ 'gzip', 'fake' ])
			assert.equal(result, 'gzip')
		})

		it('should handle selecting any as fallback', () => {
			const result = AcceptEncoding.select('br;q=1.0, gzip;q=0.8, *;q=0.1', [ 'fake' ])
			assert.equal(result, 'fake')
		})

		it('should handle selecting any', () => {
			const result = AcceptEncoding.select('*;q=0.1', [ 'gzip', 'deflate' ])
			assert.equal(result, 'gzip')
		})

	})
})
