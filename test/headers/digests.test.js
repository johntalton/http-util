import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import crypto from 'crypto'

import { WantDigest, Digest } from '@johntalton/http-util/headers'

describe('WantDigest', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = WantDigest.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
			const result = WantDigest.parse('')
			assert.deepEqual(result, new Map())
		})

		it('should handle standalone digest algo (aka no quality value)', () => {
			const result = WantDigest.parse('md5')
			assert.deepEqual(result, new Map([
				//[ 'md5', { value: true, parameters: new Map() } ]
			]))
		})

		it('should handle basic digest algo', () => {
			const result = WantDigest.parse('md5=5')
			assert.deepEqual(result, new Map([
				[ 'md5', { bare_item: 5, parameters: new Map() } ]
			]))
		})

		it('should handle discard values not a number', () => {
			const result = WantDigest.parse('md5=5, unixsum="TEST"')
			assert.deepEqual(result, new Map([
				[ 'md5', { bare_item: 5, parameters: new Map() } ]
			]))
		})

		it('should handle discard values out of range (gt)', () => {
			const result = WantDigest.parse('md5=5, unixsum=11')
			assert.deepEqual(result, new Map([
				[ 'md5', { bare_item: 5, parameters: new Map() } ]
			]))
		})

		it('should handle discard values out of range (lt)', () => {
			const result = WantDigest.parse('md5=5, unixsum=-1')
			assert.deepEqual(result, new Map([
				[ 'md5', { bare_item: 5, parameters: new Map() } ]
			]))
		})

		it('should handle multiple digest algo', () => {
			const result = WantDigest.parse('md5=5, sha-1=10')
			assert.deepEqual(result, new Map([
				[ 'md5', { bare_item: 5, parameters: new Map() } ],
				[ 'sha-1', { bare_item: 10, parameters: new Map() } ]
			]))
		})

		it('should handle base parsing', () => {
			const result = WantDigest.parse('!TEST!')
			assert.deepEqual(result, undefined)
		})
	})

	describe('selectItemFrom', () => {
		it('should handle undefined', () => {
			const result = WantDigest.selectItemFrom(undefined, [])
			assert.equal(result, undefined)
		})

		it('should handle empty dictionary', () => {
			const dictionary = new Map()
			const result = WantDigest.selectItemFrom(dictionary, [])
			assert.deepEqual(result, undefined)
		})

		it('should handle non-array supported', () => {
			const dictionary = new Map()
			const result = WantDigest.selectItemFrom(dictionary, 42)
			assert.deepEqual(result, undefined)
		})

		it('should handle dictionary with empty supported', () => {
			const dictionary = new Map([
				[ 'md5', { bare_item: 1, parameters: new Map() } ]
			])
			const result = WantDigest.selectItemFrom(dictionary, [])
			assert.deepEqual(result, undefined)
		})

		it('should handle single match', () => {
			const dictionary = new Map([
				[ 'md5', { bare_item: 1, parameters: new Map() } ]
			])
			const result = WantDigest.selectItemFrom(dictionary, [ 'md5' ])
			assert.deepEqual(result, [ 'md5', { bare_item: 1, parameters: new Map() } ])
		})

		it('should handle zero item no match', () => {
			const dictionary = new Map([
				[ 'sha-1', { bare_item: 10, parameters: new Map() } ],
				[ 'md5', { bare_item: 0, parameters: new Map() } ]
			])
			const result = WantDigest.selectItemFrom(dictionary, [ 'md5' ])
			assert.deepEqual(result, undefined)
		})

		it('should handle complex ordered match', () => {
			const dictionary = new Map([
				[ 'md5', { bare_item: 0, parameters: new Map() } ],
				[ 'sha-256', { bare_item: 10, parameters: new Map() } ],
				[ 'sha-1', { bare_item: 1, parameters: new Map() } ],
				[ 'sha-512', { bare_item: 5, parameters: new Map() } ],
			])
			const result = WantDigest.selectItemFrom(dictionary, [ 'sha-512', 'sha-256' ])
			assert.deepEqual(result, [ 'sha-256', { bare_item: 10, parameters: new Map() } ])
		})
	})
})

describe('Digest', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = Digest.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle basic empty', () => {
			const result = Digest.encode({
				algo: 'md5', digest: Uint8Array.from([ ])
			})
			assert.equal(result, 'md5=::')
		})

		it('should handle basic from digest', async () => {
			const data =  Uint8Array.from([ 42, 77 ])
			const digest = await crypto.subtle.digest('sha-256', data)

			const result = Digest.encode({
				algo: 'sha-256', digest
			})
			assert.equal(result, 'sha-256=:9S7NTgWsHOP0F32cHtjJrtsDTLqKqPfq9xVP0eFApco=:')
		})

		it('should handle invalid digest', async () => {
			const result = Digest.encode({
				algo: 'sha-256', digest: 'not a buffer'
			})
			assert.equal(result, undefined)
		})
	})
})


