import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Challenge } from '@johntalton/http-util/headers'

describe('Challenge', () => {
	describe('basic', () => {
		it('should handle undefined', () => {
			// @ts-ignore
			const result = Challenge.basic(undefined)
			assert.equal(result, undefined)
		})

		it('should handle basic basic', () => {
			const result = Challenge.basic('REALM NAME')
			assert.deepEqual(result, {
				scheme: 'Basic',
				parameters: new Map([ [ 'realm', 'REALM NAME' ], [ 'charset', 'utf-8' ] ])
			})
		})

		it('should handle basic with custom charset', () => {
			const result = Challenge.basic('REALM NAME', 'ascii')
			assert.deepEqual(result, {
				scheme: 'Basic',
				parameters: new Map([ [ 'realm', 'REALM NAME' ], [ 'charset', 'ascii' ] ])
			})
		})
	})

	describe('bearer', () => {
		it('should handle undefined', () => {
			const result = Challenge.bearer()
			assert.deepEqual(result, {
				scheme: 'Bearer',
				parameters: new Map()
			})
		})

		it('should handle with realm', () => {
			const result = Challenge.bearer('REALM')
			assert.deepEqual(result, {
				scheme: 'Bearer',
				parameters: new Map([ [ 'realm', 'REALM' ] ])
			})
		})

		it('should handle with realm and scope', () => {
			const result = Challenge.bearer('REALM', 'SCOPE')
			assert.deepEqual(result, {
				scheme: 'Bearer',
				parameters: new Map([ [ 'realm', 'REALM' ], [ 'scope', 'SCOPE' ] ])
			})
		})

		it('should handle with error and errorDescription', () => {
			const result = Challenge.bearer('REALM', undefined, 'invalid_token', 'THIS IS A TEST')
			assert.deepEqual(result, {
				scheme: 'Bearer',
				parameters: new Map([ [ 'realm', 'REALM' ], [ 'error', 'invalid_token' ], [ 'error_description', 'THIS IS A TEST' ] ])
			})
		})
	})

	describe('digest', () => {
		it('should handle undefined', () => {
		})
	})

	describe('hoba', () => {
		it('should handle undefined', () => {
		})
	})

	describe('encode', () => {
		it('should handle undefined', () => {
			const result = Challenge.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty scheme', () => {
			// @ts-ignore
			const result = Challenge.encode({})
			assert.equal(result, undefined)
		})

		it('should handle undefined', () => {
			const result = Challenge.encode({
				scheme: '',
			})
			assert.equal(result, undefined)
		})

		it('should handle undefined params', () => {
			const result = Challenge.encode({
				scheme: 'FAKE',
				parameters: undefined
			})
			assert.equal(result, 'FAKE')
		})

		it('should handle empty params', () => {
			const result = Challenge.encode({
				scheme: 'FAKE',
				parameters: new Map()
			})
			assert.equal(result, 'FAKE')
		})

		it('should handle basic params', () => {
			const result = Challenge.encode({
				scheme: 'FAKE',
				parameters: new Map([ [ 'foo', 'bar' ], [ 'biz', 'bang' ] ])
			})
			assert.equal(result, 'FAKE foo=bar,biz=bang')
		})

		it('should handle quoted params', () => {
			const result = Challenge.encode({
				scheme: 'FAKE',
				parameters: new Map([ [ 'realm', 'in space' ] ])
			})
			assert.equal(result, 'FAKE realm="in space"')
		})

		it('should handle undefined param value', () => {
			const result = Challenge.encode({
				scheme: 'FAKE',
				parameters: new Map([ [ 'single', undefined ] ])
			})
			assert.equal(result, 'FAKE single')
		})

		it('should handle array of one items ', () => {
			const result = Challenge.encode([{
				scheme: 'FAKE',
				parameters: new Map([ [ 'foo', 'bar' ], [ 'biz', 'bang' ] ])
			}])
			assert.equal(result, 'FAKE foo=bar,biz=bang')
		})

		it('should handle array of multiple items', () => {
			const result = Challenge.encode([{
				scheme: 'FAKE',
				parameters: new Map([ [ 'foo', 'bar' ], [ 'biz', 'bang' ] ])
			}, {
				scheme: 'ANOTHER',
				parameters: new Map([ [ 'quix', 'quack' ] ])
			}])
			assert.equal(result, 'FAKE foo=bar,biz=bang, ANOTHER quix=quack')
		})

		it('should handle array of multiple items (as array)', () => {
			const result = Challenge.encode([{
				scheme: 'FAKE',
				parameters: new Map([ [ 'foo', 'bar' ], [ 'biz', 'bang' ] ])
			}, {
				scheme: 'ANOTHER',
				parameters: new Map([ [ 'quix', 'quack' ] ])
			}], true)
			assert.deepEqual(result, [ 'FAKE foo=bar,biz=bang', 'ANOTHER quix=quack' ])
		})



	})
})
