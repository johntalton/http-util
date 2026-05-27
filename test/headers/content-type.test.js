import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ContentType } from '@johntalton/http-util/headers'

describe('ContentType', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = ContentType.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle null', () => {
			const result = ContentType.parse(null)
			assert.equal(result, undefined)
		})

		it('should reject invalid mime (empty string)', () => {
			const result = ContentType.parse('')
			assert.equal(result, undefined)
		})

		it('should reject invalid mime with parameters', () => {
			const result = ContentType.parse(';foo=bar')
			assert.equal(result, undefined)
		})

		it('should reject mime type of any', () => {
			const result = ContentType.parse('*')
			assert.equal(result, undefined)
		})

		it('should reject mime sub-type of any', () => {
			const result = ContentType.parse('text/*')
			assert.equal(result, undefined)
		})

		it('should handle well-known', () => {
			const result = ContentType.parse('application/json')
			assert.deepEqual(result, {
				name: 'application/json',
				mimetype: 'application/json',
				type: 'application',
				subtype: 'json',
				charset: 'utf8',
				parameters: new Map()
			})
		})

		it('should handle not well-known', () => {
			const result = ContentType.parse('text/fake')
			assert.deepEqual(result, {
				name: 'text/fake',
				mimetype: 'text/fake',
				type: 'text',
				subtype: 'fake',
				charset: undefined,
				parameters: new Map()
			})
		})

		it('should handle type with parameters', () => {
			const result = ContentType.parse('text/plain;charset=utf8')
			assert.deepEqual(result, {
				name: 'text/plain',
				mimetype: 'text/plain',
				type: 'text',
				subtype: 'plain',
				charset: 'utf8',
				parameters: new Map([
					[ 'charset', 'utf8' ]
				])
			})
		})


	})
})