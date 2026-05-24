import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Range } from '@johntalton/http-util/headers'

describe('Range', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Range.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should reject non bytes units', () => {
			const result = Range.parse('FooBar')
			assert.equal(result, undefined)
		})

		it('should reject bytes with no value', () => {
			const result = Range.parse('bytes')
			assert.equal(result, undefined)
		})

		it('should reject bytes with no value (with equal sign)', () => {
			const result = Range.parse('bytes=')
			assert.equal(result, undefined)
		})

		it('should reject bytes with no value (with dash)', () => {
			const result = Range.parse('bytes=-')
			assert.equal(result, undefined)
		})

		it('should reject bytes with invalid values', () => {
			const result = Range.parse('bytes=FOO-BAR')
			assert.equal(result, undefined)
		})

		it('should reject bytes with invalid values (open ended)', () => {
			const result = Range.parse('bytes=FOO-')
			assert.equal(result, undefined)
		})

		it('should reject bytes with invalid values (from end)', () => {
			const result = Range.parse('bytes=-BAR')
			assert.equal(result, undefined)
		})

		it('should reject bytes with single value missing dash', () => {
			const result = Range.parse('bytes=42')
			assert.equal(result, undefined)
		})

		it('should reject bytes with invalid values (end zero)', () => {
			const result = Range.parse('bytes=-0')
			assert.equal(result, undefined)
		})

		it('should handle bytes fixed single range', () => {
			const result = Range.parse('bytes=42-77')
			assert.deepEqual(result, { units: 'bytes', ranges: [ { start: 42, end: 77 } ] })
		})

		it('should handle bytes open ended single range', () => {
			const result = Range.parse('bytes=42-')
			assert.deepEqual(result, { units: 'bytes', ranges: [ { start: 42, end: '' } ] })
		})

		it('should handle bytes from end single range', () => {
			const result = Range.parse('bytes=-77')
			assert.deepEqual(result, { units: 'bytes', ranges: [ { start: '', end: 77 } ] })
		})

		it('should handle multiple byte ranges', () => {
			const result = Range.parse('bytes=-77,42-')
			assert.deepEqual(result, { units: 'bytes', ranges: [ { start: '', end: 77 }, { start: 42, end: '' } ] })
		})
	})

	describe('normalize', () => {
		it('should handle undefined', () => {
			const result = Range.normalize(undefined, 5000)
			assert.equal(result, undefined)
		})

		it('should handle fixed range', () => {
			const result = Range.normalize({
				units: 'bytes',
				ranges: [ { start: 37, end: 42 } ]
			}, 5000)
			assert.deepEqual(result, {
				units: 'bytes',
				overlap: false,
				exceeds: false,
				ranges: [ { start: 37, end: 42 } ]
			})
		})

		it('should handle multiple ranges', () => {
			const result = Range.normalize({
				units: 'bytes',
				ranges: [
					{ start: 0, end: 0 },
					{ start: '', end: 1 }
			 	]
			}, 5000)
			assert.deepEqual(result, {
				units: 'bytes',
				overlap: false,
				exceeds: false,
				ranges: [ { start: 0, end: 0 }, { start: 4999, end: 4999} ]
			})
		})

		it('should handle fixed range (open ended)', () => {
			const result = Range.normalize({
				units: 'bytes',
				ranges: [ { start: 37, end: '' } ]
			}, 5000)
			assert.deepEqual(result, {
				units: 'bytes',
				overlap: false,
				exceeds: false,
				ranges: [ { start: 37, end: 4999 } ]
			})
		})

		it('should handle fixed range (from end)', () => {
			const result = Range.normalize({
				units: 'bytes',
				ranges: [ { start: '', end: 42 } ]
			}, 5000)
			assert.deepEqual(result, {
				units: 'bytes',
				overlap: false,
				exceeds: false,
				ranges: [ { start: 4958, end: 4999 } ]
			})
		})
	})
})
