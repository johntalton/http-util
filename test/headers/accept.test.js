import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Accept } from '@johntalton/http-util/headers'

describe('Accept', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Accept.parse(undefined)
			assert.deepEqual(result, [])
		})


	})

	describe('select', () => {
		it('should handle undefined', () => {
			const result = Accept.select(undefined, undefined)
			assert.equal(result, undefined)
		})

		it('should handle undefined supported', () => {
			const result = Accept.select('', undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty supported', () => {
			const result = Accept.select('', [])
			assert.equal(result, undefined)
		})

		it('should handle basic selection', () => {
			const result = Accept.select('application/json, text/plain', [ 'text/plain' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle drop unsupported mime types', () => {
			const result = Accept.select('text/plain', [ 'text/plain', 'fake-fake' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle any fallback', () => {
			const result = Accept.select('text/plain, *', [ 'application/json' ])
			assert.equal(result, 'application/json')
		})

		it('should handle first best', () => {
			const result = Accept.select('application/json, text/plain;q=.1', [ 'text/plain', 'application/xml' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle any subtype selection', () => {
			const result = Accept.select('application/json, text/*', [ 'text/plain' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle no best match', () => {
			const result = Accept.select('application/json, application/xml', [ 'text/plain' ])
			assert.equal(result, undefined)
		})
	})
})
