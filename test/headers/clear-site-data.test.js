import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SiteData } from '@johntalton/http-util/headers'

describe('SiteData', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = SiteData.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle false', () => {
			const result = SiteData.encode(false)
			assert.equal(result, undefined)
		})

		it('should handle true', () => {
			const result = SiteData.encode(true)
			assert.equal(result, '*')
		})

		it('should handle wildcard', () => {
			const result = SiteData.encode('*')
			assert.equal(result, '*')
		})

		it('should reject unknown string', () => {
			const result = SiteData.encode('FAKE')
			assert.equal(result, undefined)
		})

		it('should reject empty object', () => {
			const result = SiteData.encode({})
			assert.equal(result, undefined)
		})

		it('should handle common options', () => {
			const result = SiteData.encode({
				cookies: true,
				storage: true
			})
			assert.equal(result, '"cookies","storage"')
		})

		it('should handle common options with some false', () => {
			const result = SiteData.encode({
				cookies: true,
				storage: false,
				cache: true
			})
			assert.equal(result, '"cache","cookies"')
		})

		it('should handle full options', () => {
			const result = SiteData.encode({
				cache: true,
				clientHints: true,
				cookies: true,
				executionContext: true,
				prefetchCache: true,
				prerenderCache: true,
				storage: true
			})
			assert.equal(result, '"cache","clientHints","cookies","executionContexts","prefetchCache","prerenderCache","storage"')
		})

		it('should handle drop unknown options', () => {
			const result = SiteData.encode({
				cookies: true,
				fake: true
			})
			assert.equal(result, '"cookies"')
		})
	})
})
