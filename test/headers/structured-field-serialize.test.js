import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { ifSupports } from '../node-version.js'

import {
	DisplayString,
  StructuredFieldSerializer,
} from '@johntalton/http-util/structured-field'

describe('Structured-Field', () => {
  describe('serialize', () => {
		it('should handle undefined', () => {
			const result = StructuredFieldSerializer.serialize(undefined)
			assert.equal(result, undefined)
		})

		it('should throw on empty string', () => {
			assert.throws(() => StructuredFieldSerializer.serialize(''), {
				name: 'SerializingError',
				message: 'unknown top-level type'
			})
		})

		it('should throw on invalid bare item (number)', () => {
			assert.throws(() => StructuredFieldSerializer.serialize(42), {
				name: 'SerializingError',
				message: 'unknown top-level type'
			})
		})

		it('should handle without parameters bare item', () => {
			const result = StructuredFieldSerializer.serialize({ value: 42 })
			assert.equal(result, '42')
		})

		it('should handle with empty parameters bare item', () => {
			const result = StructuredFieldSerializer.serialize({ value: 42, parameters: new Map() })
			assert.equal(result, '42')
		})

		it('should handle with type hint', () => {
			const result = StructuredFieldSerializer.serialize({ value: 42, parameters: new Map(), type: 'decimal' })
			assert.equal(result, '42.0')
		})

		it('should handle empty array', () => {
			const result = StructuredFieldSerializer.serialize([])
			assert.equal(result, undefined)
		})

		it('should handle empty Map', () => {
			const result = StructuredFieldSerializer.serialize(new Map([]))
			assert.equal(result, undefined)
		})

		it('should handle bare item (number)', () => {
			const result = StructuredFieldSerializer.serialize({ value: 42 })
			assert.equal(result, '42')
		})

		it('should handle bare item (decimal)', () => {
			const result = StructuredFieldSerializer.serialize({ value: 42.0015 })
			assert.equal(result, '42.002')
		})

		it('should handle bare item (token)', () => {
			const result = StructuredFieldSerializer.serialize({ value: Symbol.for('foo') })
			assert.equal(result, 'foo')
		})

		it('should handle bare item (boolean true)', () => {
			const result = StructuredFieldSerializer.serialize({ value: true })
			assert.equal(result, '?1')
		})

		it('should handle bare item (boolean false)', () => {
			const result = StructuredFieldSerializer.serialize({ value: false })
			assert.equal(result, '?0')
		})

		it('should handle bare item (string)', () => {
			const result = StructuredFieldSerializer.serialize({ value: 'TESTING' })
			assert.equal(result, '"TESTING"')
		})

		it('should handle bare item (string with escape)', () => {
			const result = StructuredFieldSerializer.serialize({ value: 'FOO\\BAR' })
			assert.equal(result, '"FOO\\\\BAR"')
		})

		it('should handle bare item (string with escape quote)', () => {
			const result = StructuredFieldSerializer.serialize({ value: '\"FOO\"' })
			assert.equal(result, '"\\"FOO\\""')
		})

		it('should handle bare item (Date)', () => {
			const result = StructuredFieldSerializer.serialize({ value: new Date(0) })
			assert.equal(result, '@0')
		})

		it('should handle bare item (Temporal)', {
			skip: !ifSupports('temporal')
		}, () => {
			const result = StructuredFieldSerializer.serialize({ value: new Temporal.Instant(0n) })
			assert.equal(result, '@0')
		})

		it('should handle bare item (byte sequence Uint8Array)', {
			skip: !ifSupports('toBase64')
		}, () => {
			const source = [ 1,2,3,4 ]
			const result = StructuredFieldSerializer.serialize({ value: Uint8Array.from(source) })
			assert.equal(result, ':AQIDBA==:')
		})

		it('should handle bare item (byte sequence ArrayBuffer)', {
			skip: !ifSupports('toBase64')
		}, () => {
			const source = [ 1,2,3,4 ]
			const result = StructuredFieldSerializer.serialize({ value: Uint8Array.from(source).buffer })
			assert.equal(result, ':AQIDBA==:')
		})

		it('should handle bare item (DisplayString)', () => {
			const result = StructuredFieldSerializer.serialize({ value: new DisplayString('👩🏻‍❤️‍💋‍👩🏼') })
			assert.equal(result, '%"%f0%9f%91%a9%f0%9f%8f%bb%e2%80%8d%e2%9d%a4%ef%b8%8f%e2%80%8d%f0%9f%92%8b%e2%80%8d%f0%9f%91%a9%f0%9f%8f%bc"')
		})

		it('should handle bare item (DisplayString basic ascii)', () => {
			const result = StructuredFieldSerializer.serialize({ value: new DisplayString('Hello World!') })
			assert.equal(result, '%"Hello World!"')
		})

		it('should handle structured list', () => {
			const result = StructuredFieldSerializer.serialize([ { value: 42, parameters: new Map() } ])
			assert.equal(result, '42')
		})

		it('should handle structured list (multiple items)', () => {
			const result = StructuredFieldSerializer.serialize([
				{ value: 42, parameters: new Map() },
				{ value: 77, parameters: new Map() }
			])
			assert.equal(result, '42, 77')
		})

		it('should handle structured list (optional parameters)', () => {
			const result = StructuredFieldSerializer.serialize([
				{ value: 42 },
				{ value: 77 }
			])
			assert.equal(result, '42, 77')
		})

		it('should handle structured empty inner-list', () => {
			const result = StructuredFieldSerializer.serialize([
				{
					value: [ ]
				}
			])

			assert.equal(result, '()')
		})

		it('should handle structured empty inner-list (with parameters)', () => {
			const result = StructuredFieldSerializer.serialize([
				{
					value: [ ],
					parameters: new Map()
						.set('foo', 'bar')
						.set('biz', true)
						.set('bang', false)
				}
			])

			assert.equal(result, '();foo="bar";biz;bang=?0')
		})

		it('should handle structured inner-list', () => {
			const result = StructuredFieldSerializer.serialize([
				{
					value: [
						{ value: 42, parameters: new Map() },
						{ value: 77, parameters: new Map() }
					],
					parameters: new Map()
				}
			])

			assert.equal(result, '(42 77)')
		})

		// it('should handle dictionary simple item', () => {
		// 	const result = StructuredFieldSerializer.serialize(new Map(Object.entries({
		// 		a: 42
		// 	})))
		// 	assert.equal(result, 'a=42')
		// })

		it('should handle dictionary', () => {
			const result = StructuredFieldSerializer.serialize(new Map(Object.entries({
				a: { value: 42 }
			})))
			assert.equal(result, 'a=42')
		})

		it('should handle dictionary (drop true)', () => {
			const result = StructuredFieldSerializer.serialize(new Map(Object.entries({
				a: { value: true }
			})))
			assert.equal(result, 'a')
		})

		it('should handle dictionary (inner-list)', () => {
			const result = StructuredFieldSerializer.serialize(new Map(Object.entries({
				a: { value: [ { value: 42 }, { value: 77 } ] }
			})))
			assert.equal(result, 'a=(42 77)')
		})

		it('should handle dictionary (inner-list with parameters)', () => {
			const result = StructuredFieldSerializer.serialize(new Map(Object.entries({
				a: { value: [ { value: 42 }, { value: 77 } ], parameters: new Map([ [ 'b', false] ]) }
			})))
			assert.equal(result, 'a=(42 77);b=?0')
		})

		it('should handle dictionary (inner-list with item parameters)', {
			skip: !ifSupports('toBase64')
		}, () => {
			const result = StructuredFieldSerializer.serialize(new Map(Object.entries({
				a: { value: [ { value: 42 }, { value: 77, parameters: new Map([ [ 'b', Uint8Array.from([ 77 ]) ] ]) } ] }
			})))
			assert.equal(result, 'a=(42 77;b=:TQ==:)')
		})

		it('should throw on token invalid chars', () => {
			assert.throws(() => StructuredFieldSerializer.serialize({
				value: 'BAD@',
				type: 'token'
			}), {
				name: 'SerializingError',
				message: 'token invalid char'
			})
		})

		it('should throw on token invalid chars', () => {
			assert.throws(() => StructuredFieldSerializer.serialize({
				value: 'BAD\tSTRING'
			}), {
				name: 'SerializingError',
				message: 'string invalid char'
			})
		})

  })

	describe('isTypeInteger', () => {})

	describe('isTypeDecimal', () => {})

	describe('isTypeString', () => {})

	describe('isTypeToken', () => {})

	describe('isTypeByteSequence', () => {})

	describe('isTypeBoolean', () => {})

	describe('isTypeDate', () => {})

	describe('isTypeDisplayString', () => {})

	describe('isBareItem', () => {})

	describe('isItemType', () => {})

	describe('isItemTypeWithParameters', () => {})

})