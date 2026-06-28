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

		it('should handle continuation format', () => {
			const result = ContentDisposition.parse(' attachment; filename="fallback.txt"; filename*=UTF-8\'\'%E2%82%AC%20rates.txt')
			assert.deepEqual(result, {
				disposition: 'attachment',
				filename: 'fallback.txt',
				name: undefined,
				parameters: new Map([
					[ 'filename', 'fallback.txt' ],
					[ 'filename*', 'UTF-8\'\'%E2%82%AC%20rates.txt' ]
				])
			})
		})
	})

	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ContentDisposition.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty object', () => {
			// @ts-ignore
			const result = ContentDisposition.encode({})
			assert.equal(result, undefined)
		})

		it('should handle basic directive', () => {
			const result = ContentDisposition.encode({ disposition: 'inline' })
			assert.equal(result, 'inline')
		})

		it('should handle with filename', () => {
			const result = ContentDisposition.encode({ disposition: 'inline', filename: 'FAKE.xml' })
			assert.equal(result, 'inline; filename="FAKE.xml"')
		})

		it('should handle with name and parameters', () => {
			const result = ContentDisposition.encode({
				disposition: 'form-data',
				name: 'FAKE',
				parameters: new Map([
					[ 'FOO', '3' ]
				])
			})
			assert.equal(result, 'form-data; name="FAKE"; FOO=3')
		})
	})
})
