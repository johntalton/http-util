import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { KVP } from '@johntalton/http-util/util'

describe('KVP', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = KVP.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
			const result = KVP.parse('')
			assert.equal(result, undefined)
		})

		it('should handle dangling semi-colon', () => {
			const result = KVP.parse(';')
			assert.equal(result, undefined)
		})

		it('should handle named only', () => {
			const result = KVP.parse('NAME')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map()
			})
		})

		it('should handle named and semi', () => {
			const result = KVP.parse('NAME;')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map()
			})
		})

		it('should handle named and empty param', () => {
			const result = KVP.parse('NAME;=""')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map()
			})
		})

		it('should handle named and name only param', () => {
			const result = KVP.parse('NAME;foo')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map([ [ 'foo', undefined] ])
			})
		})

		it('should handle named and empty value param', () => {
			const result = KVP.parse('NAME;foo=')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map([ [ 'foo', undefined ] ])
			})
		})

		it('should handle named and empty quoted value param', () => {
			const result = KVP.parse('NAME;foo=""')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map([ [ 'foo', undefined ] ])
			})
		})

		it('should handle selecting first key value', () => {
			const result = KVP.parse('NAME;foo=2;foo=3')
			assert.deepEqual(result, {
				name: 'NAME',
				parameters: new Map([ [ 'foo', '2' ] ])
			})
		})
	})

	describe('parseParameters', () => {
		it('should handle undefined', () => {
			const result = KVP.parseParameters(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
			const result = KVP.parseParameters('')
			assert.equal(result, undefined)
		})
	})
})