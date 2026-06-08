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
		// todo move select test here after conversion
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
