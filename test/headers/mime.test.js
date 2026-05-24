import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Mime } from '@johntalton/http-util/util'

describe('Mime', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Mime.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
			const result = Mime.parse('')
			assert.equal(result, undefined)
		})

		it('should reject multiple slashes', () => {
			const result = Mime.parse('one/two/three')
			assert.equal(result, undefined)
		})

		it('should reject no type', () => {
			const result = Mime.parse('/')
			assert.equal(result, undefined)
		})

		it('should reject type with special chars', () => {
			const result = Mime.parse('@@@/')
			assert.equal(result, undefined)
		})

		it('should reject subtype with special chars', () => {
			const result = Mime.parse('valid/@@@')
			assert.equal(result, undefined)
		})

		it('should handle empty subtype', () => {
			const result = Mime.parse('valid')
			assert.deepEqual(result, { mimetype: 'valid/*', type: 'valid', subtype: '*' })
		})

		it('should handle empty subtype (with slash)', () => {
			const result = Mime.parse('valid/')
			assert.deepEqual(result, { mimetype: 'valid/*', type: 'valid', subtype: '*' })
		})

		it('should handle valid mimetype', () =>{
			const result = Mime.parse('text/plain')
			assert.deepEqual(result, { mimetype: 'text/plain', type: 'text', subtype: 'plain' })
		})

		it('should handle valid mimetype (with whitespace)', () =>{
			const result = Mime.parse('\ttext/plain ')
			assert.deepEqual(result, { mimetype: 'text/plain', type: 'text', subtype: 'plain' })
		})
	})
})
