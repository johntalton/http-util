import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import crypto from 'crypto'

import { ifSupports } from '../node-version.js'

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
				[ 'md5', { preference: 5, parameters: new Map() } ]
			]))
		})

		it('should handle discard values not a number', () => {
			const result = WantDigest.parse('md5=5, unixsum="TEST"')
			assert.deepEqual(result, new Map([
				[ 'md5', { preference: 5, parameters: new Map() } ]
			]))
		})

		it('should handle discard values out of range (gt)', () => {
			const result = WantDigest.parse('md5=5, unixsum=11')
			assert.deepEqual(result, new Map([
				[ 'md5', { preference: 5, parameters: new Map() } ]
			]))
		})

		it('should handle discard values out of range (lt)', () => {
			const result = WantDigest.parse('md5=5, unixsum=-1')
			assert.deepEqual(result, new Map([
				[ 'md5', { preference: 5, parameters: new Map() } ]
			]))
		})

		it('should handle multiple digest algo', () => {
			const result = WantDigest.parse('md5=5, sha-1=10')
			assert.deepEqual(result, new Map([
				[ 'md5', { preference: 5, parameters: new Map() } ],
				[ 'sha-1', { preference: 10, parameters: new Map() } ]
			]))
		})

		it('should handle base parsing', () => {
			const result = WantDigest.parse('!TEST!')
			assert.deepEqual(result, undefined)
		})
	})

	describe('selectItemsFrom', () => {
		it('should handle undefined', () => {
			const result = WantDigest.selectItemsFrom(undefined, [])
			assert.equal(result, undefined)
		})

		it('should handle empty dictionary', () => {
			const dictionary = new Map()
			const result = WantDigest.selectItemsFrom(dictionary, [])
			assert.deepEqual(result, undefined)
		})

		it('should handle non-array supported', () => {
			const dictionary = new Map()
			// @ts-ignore
			const result = WantDigest.selectItemsFrom(dictionary, 42)
			assert.deepEqual(result, undefined)
		})

		it('should handle dictionary with empty supported', () => {
			const dictionary = new Map([
				[ 'md5', { preference: 1, parameters: new Map() } ]
			])
			const result = WantDigest.selectItemsFrom(dictionary, [])
			assert.deepEqual(result, undefined)
		})

		it('should handle single match', () => {
			const dictionary = new Map([
				[ 'md5', { preference: 1, parameters: new Map() } ]
			])
			const result = WantDigest.selectItemsFrom(dictionary, [ 'md5' ])
			assert.deepEqual(result, [
				{ algo: 'md5', preference: 1, parameters: new Map() }
			])
		})

		it('should handle zero item no match', () => {
			const dictionary = new Map([
				[ 'sha-1', { preference: 10, parameters: new Map() } ],
				[ 'md5', { preference: 0, parameters: new Map() } ]
			])
			const result = WantDigest.selectItemsFrom(dictionary, [ 'md5' ])
			assert.deepEqual(result, [])
		})

		it('should handle complex ordered match', () => {
			const dictionary = new Map([
				[ 'md5', { preference: 0, parameters: new Map() } ],
				[ 'sha-256', { preference: 10, parameters: new Map() } ],
				[ 'sha-1', { preference: 1, parameters: new Map() } ],
				[ 'sha-512', { preference: 5, parameters: new Map() } ],
			])
			const result = WantDigest.selectItemsFrom(dictionary, [ 'sha-512', 'sha-256' ])
			assert.deepEqual(result, [
				{ algo: 'sha-256', preference: 10, parameters: new Map() },
				{ algo: 'sha-512', preference: 5, parameters: new Map() }
			])
		})
	})

	describe('encode', () => {
		it('should handle undefined', () => {
			const result = WantDigest.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle non Map input', () => {
			// @ts-ignore
			const result = WantDigest.encode(false)
			assert.equal(result, undefined)
		})

		it('should handle empty map', () => {
			const result = WantDigest.encode(new Map())
			assert.equal(result, undefined)
		})

		it('should handle invalid map', () => {
			const result = WantDigest.encode(new Map([
				[ '!badKey', 1 ]
			]))
			assert.equal(result, undefined)
		})

		it('should handle basic map', () => {
			const result = WantDigest.encode(new Map([
				[ 'md5', 1 ]
			]))
			assert.equal(result, 'md5=1')
		})
	})
})

describe('Digest', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Digest.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle undefined', () => {
			const result = Digest.parse('')
			assert.deepEqual(result, new Map())
		})

		it('should handle invalid input', () => {
			const result = Digest.parse('(TEST)')
			assert.deepEqual(result, undefined)
		})

		it('should handle multi values', {
			skip: !ifSupports('fromBase64')
		}, async () => {
			const data =  Uint8Array.from([ 42, 77 ])
			const digest512 = await crypto.subtle.digest('sha-512', data)
			const digest1 = await crypto.subtle.digest('sha-1', data)

			const result = Digest.parse('sha-512=:zW5lgbChR0Go4ALiq25ySooOvhWUrd/fQ/2ZLkDbE2jiJu5Gef9c0xl4B17ciV/sCf2qtQ9JmlcOJRu9mY/tPg==:, sha-1=:/P0uXjWsRr5PQ0WLFR3lEqwTDGA=:')
			assert.deepEqual(result, new Map([
				[ 'sha-1', { bare_item: new Uint8Array(digest1), parameters: new Map() }],
				[ 'sha-512', { bare_item: new Uint8Array(digest512), parameters: new Map() }]
			]))
		})
	})

	describe('encode', () => {
		it('should handle undefined', () => {
			const result = Digest.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle non Map input', () => {
			// @ts-ignore
			const result = Digest.encode(false)
			assert.equal(result, undefined)
		})

		it('should handle basic empty', {
			skip: !ifSupports('toBase64')
		}, () => {
			const result = Digest.encode({
				algo: 'md5', digest: Uint8Array.from([ ])
			})
			assert.equal(result, 'md5=::')
		})

		it('should handle basic from digest', {
			skip: !ifSupports('toBase64')
		}, async () => {
			const data =  Uint8Array.from([ 42, 77 ])
			const digest = await crypto.subtle.digest('sha-256', data)

			const result = Digest.encode({
				algo: 'sha-256', digest
			})
			assert.equal(result, 'sha-256=:9S7NTgWsHOP0F32cHtjJrtsDTLqKqPfq9xVP0eFApco=:')
		})

		it('should handle multiple digests', {
			skip: !ifSupports('toBase64')
		}, async () => {
			const data =  Uint8Array.from([ 42, 77 ])
			const digest512 = await crypto.subtle.digest('sha-512', data)
			const digest1 = await crypto.subtle.digest('sha-1', data)

			const result = Digest.encode([
				{ algo: 'sha-512', digest: digest512 },
				{ algo: 'sha-1', digest: digest1 }
			])
			assert.equal(result, 'sha-512=:zW5lgbChR0Go4ALiq25ySooOvhWUrd/fQ/2ZLkDbE2jiJu5Gef9c0xl4B17ciV/sCf2qtQ9JmlcOJRu9mY/tPg==:, sha-1=:/P0uXjWsRr5PQ0WLFR3lEqwTDGA=:')
		})

		it('should handle invalid digest', async () => {
			// @ts-ignore
			const result = Digest.encode({
				algo: 'sha-256', digest: 'not a buffer'
			})
			assert.equal(result, undefined)
		})

		it('should handle undefined digest algo', async () => {
			// @ts-ignore
			const result = Digest.encode({
				algo: undefined, digest: Uint8Array.from([ ])
			})
			assert.equal(result, undefined)
		})

		it('should handle undefined digest digest', async () => {
			// @ts-ignore
			const result = Digest.encode({
				algo: 'md5', digest: undefined
			})
			assert.equal(result, undefined)
		})
	})
})

