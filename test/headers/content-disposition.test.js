import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ContentDisposition } from '@johntalton/http-util/headers'

describe('ContentDisposition', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = ContentDisposition.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
			const result = ContentDisposition.parse('')
			assert.equal(result, undefined)
		})

		it('should handle single directive', () => {
			const result = ContentDisposition.parse('form-data')
			assert.deepEqual(result, {
				disposition: 'form-data',
				filename: undefined,
				name: undefined,
				parameters: new Map()
			})
		})

		it('should handle directive with filename param', () => {
			const result = ContentDisposition.parse('form-data; filename="file name.jpg"')
			assert.deepEqual(result, {
				disposition: 'form-data',
				filename: 'file name.jpg',
				name: undefined,
				parameters: new Map([
					[ 'filename', 'file name.jpg' ]
				])
			})
		})

		it('should handle directive extended parameters', () => {
			const result = ContentDisposition.parse('form-data;title*=us-ascii\'en-us\'This%20is%20%2A%2A%2Afun%2A%2A%2A')
			assert.deepEqual(result, {
				disposition: 'form-data',
				filename: undefined,
				name: undefined,
				parameters: new Map([
					[ 'title*', 'us-ascii\'en-us\'This%20is%20%2A%2A%2Afun%2A%2A%2A']
				])
			})
		})

		it('should handle directive with whitespace', () => {
			const result = ContentDisposition.parse('    form-data ; name')
			assert.deepEqual(result, {
				disposition: 'form-data',
				filename: undefined,
				name: undefined,
				parameters: new Map([
					[ 'name', undefined ]
				])
			})
		})

	})
})
