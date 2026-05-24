import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CacheControl } from '@johntalton/http-util/headers'

describe('CacheControl', () => {
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

		it('should include directives (single)', () => {
			const result = CacheControl.encode({
				directives: 'no-store'
			})
			assert.equal(result,  'no-store')
		})

		it('should handle public', () => {
			const result = CacheControl.encode({
				pub: true
			})
			assert.equal(result, 'public')
		})

		it('should handle private', () => {
			const result = CacheControl.encode({
				priv: true
			})
			assert.equal(result, 'private')
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
	})
})
