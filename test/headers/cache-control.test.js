import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CacheControl } from '@johntalton/http-util/headers'

describe('CacheControl', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = CacheControl.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
				const result = CacheControl.parse('')
			assert.deepEqual(result, {})
		})

		it('should throw on non string', () => {
			assert.throws(() => CacheControl.parse(42), {
				name: 'TypeError',
				message: 'parameter must be a string'
			})
		})

		it('should handle single item', () => {
			const result = CacheControl.parse('max-age=42')
			assert.deepEqual(result, {
				maxAge: 42,
				directives: []
			})
		})

		it('should handle list of items', () => {
			const result = CacheControl.parse('max-stale=42, only-if-cached')
			assert.deepEqual(result, {
				maxStale: 42,
				directives: [ 'only-if-cached' ]
			})
		})

		it('should handle missing min-fresh value', () => {
			const result = CacheControl.parse('min-fresh')
			assert.deepEqual(result, {
				directives: []
			})
		})

		it('should handle negative min-fresh value', () => {
			const result = CacheControl.parse('min-fresh=-42')
			assert.deepEqual(result, {
				directives: []
			})
		})

		it('should handle max 32 int min-fresh value', () => {
			const result = CacheControl.parse('min-fresh=2147483648')
			assert.deepEqual(result, {
				minFresh: 2147483648,
				directives: []
			})
		})

		it('should handle max 32 int min-fresh value +1', () => {
			const result = CacheControl.parse('min-fresh=2147483649')
			assert.deepEqual(result, {
				minFresh: 2147483649,
				directives: []
			})
		})


		it('should handle drop unknown', () => {
			const result = CacheControl.parse('no-cache, some-fake')
			assert.deepEqual(result, {
				directives: [ 'no-cache' ]
			})
		})

		it('should handle drop no-cache params', () => {
			const result = CacheControl.parse('no-cache="no-valid"')
			assert.deepEqual(result, {
				directives: [ 'no-cache' ]
			})
		})
	})

	describe('encode', () => {
		it('should handle undefined', () => {
			const result = CacheControl.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty options', () => {
			const result = CacheControl.encode({})
			assert.equal(result, undefined)
		})

		it('should include directives', () => {
			const result = CacheControl.encode({
				pub: true,
				priv: false,
				directives: [ 'no-cache', 'no-transform' ]
			})
			assert.equal(result, 'public, no-cache, no-transform')
		})

		it('should include directives (as array)', () => {
			const result = CacheControl.encode({
				pub: true,
				priv: false,
				directives: [ 'no-cache', 'no-transform' ]
			}, true)
			assert.deepEqual(result, [ 'public', 'no-cache', 'no-transform' ])
		})

		it('should include directives (single)', () => {
			const result = CacheControl.encode({
				directives: 'no-store'
			})
			assert.equal(result, 'no-store')
		})

		it('should handle public', () => {
			const result = CacheControl.encode({
				pub: true
			})
			assert.equal(result, 'public')
		})

		it('should handle public (directive)', () => {
			const result = CacheControl.encode({
				directives: 'public'
			})
			assert.equal(result, 'public')
		})

		it('should handle public (singleton duplicate)', () => {
			const result = CacheControl.encode({
				pub: true,
				directives: 'public'
			})
			assert.equal(result, 'public')
		})

		it('should handle private', () => {
			const result = CacheControl.encode({
				priv: true
			})
			assert.equal(result, 'private')
		})

		it('should handle private private mix', () => {
			const result = CacheControl.encode({
				pub: true,
				priv: true
			})
			assert.equal(result, undefined)
		})

		it('should handle private private mix (directive)', () => {
			const result = CacheControl.encode({
				directives: [ 'public', 'private' ]
			})
			assert.equal(result, undefined)
		})

		it('should handle private (qualified)', () => {
			const result = CacheControl.encode({
				priv: 'some-header',
			})
			assert.equal(result, 'private="some-header"')
		})

		it('should handle private (qualified list)', () => {
			const result = CacheControl.encode({
				priv: [ 'some-header', 'and-another' ],
			})
			assert.equal(result, 'private="some-header,and-another"')
		})

		it('should include no-cache directive', () => {
			const result = CacheControl.encode({
				directives: 'no-cache'
			})
			assert.equal(result, 'no-cache')
		})

		it('should include no-cache directive (array)', () => {
			const result = CacheControl.encode({
				directives: ['no-cache', 'no-cache']
			})
			assert.equal(result, 'no-cache')
		})

		it('should include no-cache directive (duplicate)', () => {
			const result = CacheControl.encode({
				noCache: true,
				directives: 'no-cache'
			})
			assert.equal(result, 'no-cache')
		})

		it('should include no-cache directive with field', () => {
			const result = CacheControl.encode({
				noCache: ['a', 'b']
			})
			assert.equal(result, 'no-cache="a,b"')
		})

		it('should include no-cache directive with field', () => {
			const result = CacheControl.encode({
				noCache: ['a', 'b'],
				directives: 'no-cache'
			})
			assert.equal(result, 'no-cache="a,b"')
		})

		it('should disallow pub and priv (only)', () => {
			const result = CacheControl.encode({
				pub: true,
				priv: true
			})
			assert.equal(result, undefined)
		})

		it('should disallow pub and priv (drop)', () => {
			const result = CacheControl.encode({
				pub: true,
				priv: true,
				maxAge: 42
			})
			assert.equal(result, 'max-age=42')
		})

		it('should validate max age (is zero)', () => {
			const result = CacheControl.encode({
				maxAge: 0
			})
			assert.equal(result, 'max-age=0')
		})

		it('should validate max age (is number)', () => {
			const result = CacheControl.encode({
				maxAge: 'foo'
			})
			assert.equal(result, undefined)
		})

		it('should validate max age (is non-negative)', () => {
			const result = CacheControl.encode({
				maxAge: -42
			})
			assert.equal(result, undefined)
		})

		it('should handle state while revalidate', () => {
			const result = CacheControl.encode({
				staleWhileRevalidate: 42
			})
			assert.equal(result, 'stale-while-revalidate=42')
		})

		it('should validate state while revalidate (is number)', () => {
			const result = CacheControl.encode({
				staleWhileRevalidate: 'foo'
			})
			assert.equal(result, undefined)
		})

		it('should validate state while revalidate (is non-negative)', () => {
			const result = CacheControl.encode({
				staleWhileRevalidate: -42
			})
			assert.equal(result, undefined)
		})

		it('should handle state if error', () => {
			const result = CacheControl.encode({
				staleIfError: 42
			})
			assert.equal(result, 'stale-if-error=42')
		})

		it('should validate state if error (is number)', () => {
			const result = CacheControl.encode({
				staleIfError: 'foo'
			})
			assert.equal(result, undefined)
		})

		it('should validate state if error (is non-negative)', () => {
			const result = CacheControl.encode({
				staleIfError: -42
			})
			assert.equal(result, undefined)
		})

		it('should handle extensions', () => {
			const result = CacheControl.encode({
				pub: true,
				directives: 'community="UCI"'
			})
			assert.equal(result, 'public, community="UCI"')
		})
	})
})
