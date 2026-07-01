import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ContentDisposition, fallbackFilenameSafe } from '@johntalton/http-util/headers'

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

		it('should handle single directive (case-insensitive)', () => {
			const result = ContentDisposition.parse('ATTACHMENT')
			assert.deepEqual(result, {
				disposition: 'attachment',
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

		it('should handle directive with filename param (unquoted)', () => {
			const result = ContentDisposition.parse('form-data; filename=file_name.jpg')
			assert.deepEqual(result, {
				disposition: 'form-data',
				filename: 'file_name.jpg',
				name: undefined,
				parameters: new Map([
					[ 'filename', 'file_name.jpg' ]
				])
			})
		})

		it('should handle directive with filename param (case insensitive)', () => {
			const result = ContentDisposition.parse('form-data; FILENAME="file name.jpg"')
			assert.deepEqual(result, {
				disposition: 'form-data',
				filename: 'file name.jpg',
				name: undefined,
				parameters: new Map([
					[ 'filename', 'file name.jpg' ]
				])
			})
		})

		it('should handle directive extended parameters (filename)', () => {
			const result = ContentDisposition.parse('form-data;filename*=UTF-8\'\'This%20is%20%2A%2A%2Afun%2A%2A%2A')
			assert.deepEqual(result, {
				disposition: 'form-data',
				// filename: 'This is ***fun***',
				filename: undefined,
				name: undefined,
				parameters: new Map([
					[ 'filename*', 'UTF-8\'\'This%20is%20%2A%2A%2Afun%2A%2A%2A']
				])
			})
		})

		it('should handle directive extended parameters (alt parameter)', () => {
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

		it('should handle extended format', () => {
			const result = ContentDisposition.parse(' attachment; filename="fallback.txt"; filename*=UTF-8\'\'%E2%82%AC%20rates.txt')
			assert.deepEqual(result, {
				disposition: 'attachment',
				// filename: '€ rates.txt',
				filename: 'fallback.txt',
				name: undefined,
				parameters: new Map([
					[ 'filename', 'fallback.txt' ],
					[ 'filename*', 'UTF-8\'\'%E2%82%AC%20rates.txt' ]
				])
			})
		})

		it('should handle continuation format', () => {
			const result = ContentDisposition.parse('attachment; filename*0*=UTF-8\'\'foo-%c3%a4; filename*1=".html"')
			assert.deepEqual(result, {
				disposition: 'attachment',
				filename: undefined,
				name: undefined,
				parameters: new Map([
					[ 'filename*0*', 'UTF-8\'\'foo-%c3%a4' ],
					[ 'filename*1', '.html' ]
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

		//
		//
		//

		it('should handle empty filename', () => {
			const result = ContentDisposition.encode({
				disposition: 'attachment',
				filename: ''
			})
			assert.equal(result, 'attachment; filename=""')
		})

		it('should handle us-ascii filename', () => {
			const result = ContentDisposition.encode({
				disposition: 'attachment',
				filename: 'FAKE.pdf'
			})
			assert.equal(result, 'attachment; filename="FAKE.pdf"')
		})

		it('should handle escape quoted', () => {
			const result = ContentDisposition.encode({
				disposition: 'attachment',
				filename: 'the "plans".pdf'
			})
			assert.equal(result, 'attachment; filename="the -plans-.pdf"; filename*=UTF-8\'\'the%20%22plans%22.pdf')
		})

		it('should handle non-ascii', () => {
			const result = ContentDisposition.encode({
				disposition: 'attachment',
				filename: 'ä.fake'
			})
			assert.equal(result, 'attachment; filename="a.fake"; filename*=UTF-8\'\'%C3%A4.fake')
		})

		it('should handle windows share style', () => {
			const result = ContentDisposition.encode({
				disposition: 'attachment',
				filename: String.raw`\\share\path\file.ext`
			})
			assert.equal(result, 'attachment; filename="-share-path-file.ext"; filename*=UTF-8\'\'%5C%5Cshare%5Cpath%5Cfile.ext')
		})

	})

	describe('fallbackFilenameSafe', () => {
		it('should handle undefined', () => {
			const result = fallbackFilenameSafe(undefined)
			assert.equal(result, undefined)
		})

		it('should handle valid ascii', () => {
			const result = fallbackFilenameSafe('test123')
			assert.equal(result, 'test123')
		})

		it('should handle replacing invalid ascii (preserving existing hyphen)', () => {
			const result = fallbackFilenameSafe('test-🧟')
			assert.equal(result, 'test--')
		})

		it('should handle removing duplicated chars with only single replacement', () => {
			const result = fallbackFilenameSafe('test🙉🙈🙊')
			assert.equal(result, 'test-')
		})

		it('should handle and preserve letters from diacritical', () => {
			const result = fallbackFilenameSafe('my cliché résumé.txt')
			assert.equal(result, 'my cliche resume.txt')
		})

		it('should handle and preserve letters from diacritical (more)', () => {
			const result = fallbackFilenameSafe('señor naïve.webp')
			assert.equal(result, 'senor naive.webp')
		})

	})
})
