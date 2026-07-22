import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
	isAlpha,
	isDecimal,
	isDigit,
	isLCAlpha,
	isSP,
  isTChar,
  isVChar,
  StructuredField,
} from '@johntalton/http-util/structured-field'

describe('StructuredField', () => {
	describe('encode', () => {
		it('should pass to serializer', () => {
			const result = StructuredField.encode([ { value: 42} ])
			assert.equal(result, '42')
		})
	})

	describe('parse', () => {
		it('should pass to serializer', () => {
			const result = StructuredField.parse('42', 'list')
			assert.deepEqual(result, [ { bare_item: 42, parameters: new Map() }] )
		})
	})


	describe('isDecimal', () => {
		it('should handle undefined', () => {
			const result = isDecimal(undefined)
			assert.equal(result, false)
		})


	})

	describe('isLCAlpha', () => {
		it('should handle undefined', () => {
			const result = isLCAlpha(undefined)
			assert.equal(result, false)
		})


	})

	describe('isDigit', () => {
		it('should handle undefined', () => {
			const result = isDigit(undefined)
			assert.equal(result, false)
		})


	})

	describe('roundBankers', () => {

	})

	describe('isVChar', () => {
		it('should handle undefined', () => {
			const result = isVChar(undefined)
			assert.equal(result, false)
		})


	})

	describe('isSP', () => {
		it('should handle undefined', () => {
			const result = isSP(undefined)
			assert.equal(result, false)
		})


	})

	describe('isAlpha', () => {
		it('should handle undefined', () => {
			const result = isAlpha(undefined)
			assert.equal(result, false)
		})


	})

	describe('isTChar', () => {
		it('should handle undefined', () => {
			const result = isTChar(undefined)
			assert.equal(result, false)
		})


	})

})
