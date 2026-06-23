import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Mime } from '@johntalton/http-util/util'

const ITEM_JSON = {
	name: 'application/json;charset=utf-8',
	mimetype: 'application/json',
	type: 'application',
	subtype: 'json',
	parameters: new Map([[ 'charset', 'utf-8']])
}

const ITEM_PLAIN = {
	name: 'text/plain;charset=utf-8',
	mimetype: 'text/plain',
	type: 'text',
	subtype: 'plain',
	parameters: new Map([[ 'charset', 'utf-8']])
}

const ITEM_APPLICATION_ANY = {
	name: 'application/*',
	mimetype: 'application/*',
	type: 'application',
	subtype: '*',
	parameters: new Map([])
}

const ITEM_ANY = {
	name: '*',
	mimetype: '*/*',
	type: '*',
	subtype: '*',
	parameters: new Map([])
}

describe('Mime', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Mime.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle null', () => {
			assert.throws(() => Mime.parse(null), {
				name: 'TypeError',
				message: 'parameter must be a string'
			})
		})

		it('should throw invalid type', () => {
			assert.throws(() => Mime.parse(42), {
				name: 'TypeError',
				message: 'parameter must be a string'
			})
		})

		it('should handle String object', () => {
			// @ts-ignore
			const result = Mime.parse(new String('TEST'))
			assert.deepEqual(result, { mimetype: 'test/*', type: 'test', subtype: '*' })
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

		it('should handle valid mimetype (any)', () =>{
			const result = Mime.parse('*')
			assert.deepEqual(result, { mimetype: '*/*', type: '*', subtype: '*' })
		})

		it('should handle valid mimetype (any subtype)', () =>{
			const result = Mime.parse('text/*')
			assert.deepEqual(result, { mimetype: 'text/*', type: 'text', subtype: '*' })
		})

		it('should handle valid mimetype (any any)', () =>{
			const result = Mime.parse('*/*')
			assert.deepEqual(result, { mimetype: '*/*', type: '*', subtype: '*' })
		})
	})

	describe('matches', () => {
		it('should handle undefined (both)', () => {
			const result = Mime.matches(undefined, undefined)
			assert.equal(result, false)
		})

		it('should handle undefined (first)', () => {
			const result = Mime.matches(undefined, ITEM_JSON)
			assert.equal(result, false)
		})

		it('should handle undefined (second)', () => {
			const result = Mime.matches(ITEM_JSON, undefined)
			assert.equal(result, false)
		})

		it('should handle (identity)', () => {
			const result = Mime.matches(ITEM_JSON, ITEM_JSON)
			assert.equal(result, true)
		})

		it('should handle (any subtype)', () => {
			const result = Mime.matches(ITEM_JSON, ITEM_APPLICATION_ANY)
			assert.equal(result, true)
		})

		it('should handle (any any)', () => {
			const result = Mime.matches(ITEM_JSON, ITEM_ANY)
			assert.equal(result, true)
		})

		it('should handle not match', () => {
			const result = Mime.matches(ITEM_JSON, ITEM_PLAIN)
			assert.equal(result, false)
		})

	})
})
