import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ifSupports } from '../node-version.js'

import { UseAsDictionary, AvailableDictionary, DictionaryID } from '@johntalton/http-util/headers'

describe('UseAsDictionary', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = UseAsDictionary.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty structure', () => {
			const result = UseAsDictionary.encode({})
			assert.equal(result, undefined)
		})

		it('should handle simple match string', () => {
			const result = UseAsDictionary.encode({
				match: '/d%C3%BCsseldorf'
			})
			assert.equal(result, 'match="/d%C3%BCsseldorf"')
		})

		it('should handle simple match pattern', {
					skip: !ifSupports('urlPattern')
			}, () => {
			const result = UseAsDictionary.encode({
				match: new URLPattern({ pathname: '/product/*' })
			})
			assert.equal(result, 'match="/product/*"')
		})

		it('should reject simple match pattern with regex', {
			skip: !ifSupports('urlPattern')
		}, () => {
			const result = UseAsDictionary.encode({
				match: new URLPattern({ pathname: '/blog/(\\d+)' })
			})
			assert.equal(result, undefined)
		})

		it('should handle simple match pattern with dest', {
			skip: !ifSupports('urlPattern')
		}, () => {
			const result = UseAsDictionary.encode({
				match: new URLPattern({ pathname: '/product/*' }),
				matchDest: 'document'
			})
			assert.equal(result, 'match="/product/*", match-dest=("document")')
		})

		it('should handle simple match pattern with id', {
			skip: !ifSupports('urlPattern')
		}, () => {
			const result = UseAsDictionary.encode({
				match: new URLPattern({ pathname: '/app/*/main.js' }),
				id: 'dictionary-12345'
			})
			assert.equal(result, 'match="/app/*/main.js", id="dictionary-12345"')
		})

		it('should handle simple match with type raw', () => {
			const result = UseAsDictionary.encode({
				match: 'foo-bar',
				type: 'raw'

			})
			assert.equal(result, 'match="foo-bar", type=raw')
		})

		it('should reject bad type token', () => {
			const result = UseAsDictionary.encode({
				match: 'foo-bar',
				type: '_raw'

			})
			assert.equal(result, undefined)
		})

	})
})

describe('AvailableDictionary', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = AvailableDictionary.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle basic header', {
			skip: !ifSupports('toBase64')
		}, () => {
			const result = AvailableDictionary.parse(':pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=:')
			assert.ok(result instanceof Uint8Array)
			assert.ok(ArrayBuffer.isView(result))
			assert.equal(result?.length, 32)

			const u8 = Uint8Array.from([
				165, 145, 166, 212,  11, 244,  32,  64,
         74,   1,  23,  51, 207, 183, 177, 144,
        214,  44, 101, 191,  11, 205, 163,  43,
         87, 178, 119, 217, 173, 159,  20, 110
			])
			assert.deepEqual(result, u8)
		})



	})
})

describe('DictionaryID', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = DictionaryID.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle simple string', () => {
			const result = DictionaryID.parse(' "dictionary-12345"')
			assert.equal(result, 'dictionary-12345')
		})
	})
})