import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ContentRange } from '@johntalton/http-util/headers'

describe('ContentRange', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ContentRange.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty directive', () => {
			const result = ContentRange.encode({})
			assert.equal(result, 'bytes */*')
		})

		it('should reject invalid unites', () => {
			const result = ContentRange.encode({
				units: 'TEST'
			})
			assert.equal(result, undefined)
		})

		it('should reject invalid range', () => {
			const result = ContentRange.encode({
				range: 'TEST'
			})
			assert.equal(result, undefined)
		})

		it('should reject invalid size', () => {
			const result = ContentRange.encode({
				units: 'bytes',
				size: 'NOT A NUMBER'
			})
			assert.equal(result, undefined)
		})

		it('should handle any size', () => {
			const result = ContentRange.encode({
				units: 'bytes',
				size: '*'
			})
			assert.equal(result, 'bytes */*')
		})

		it('should handle size value', () => {
			const result = ContentRange.encode({
				units: 'bytes',
				size: 42
			})
			assert.equal(result, 'bytes */42')
		})

		it('should handle fully specified range and size', () => {
			const result = ContentRange.encode({
				units: 'bytes',
				size: 42,
				range: {
					start: 0,
					end: 42
				}
			})
			assert.equal(result, 'bytes 0-42/42')
		})

		it('should handle range with any size', () => {
			const result = ContentRange.encode({
				units: 'bytes',
				size: '*',
				range: {
					start: 0,
					end: 42
				}
			})
			assert.equal(result, 'bytes 0-42/*')
		})

	})
})
