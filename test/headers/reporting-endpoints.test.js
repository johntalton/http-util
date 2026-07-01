import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ReportingEndpoints } from '@johntalton/http-util/headers'

describe('ReportingEndpoints', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ReportingEndpoints.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty item', () => {
			// @ts-ignore
			const result = ReportingEndpoints.encode({})
			assert.equal(result, undefined)
		})

		it('should handle empty array', () => {
			const result = ReportingEndpoints.encode([])
			assert.equal(result, undefined)
		})

		it('should handle array of empty item', () => {
			// @ts-ignore
			const result = ReportingEndpoints.encode([ {} ])
			assert.equal(result, undefined)
		})

		it('should handle item with undefined url', () => {
			// @ts-ignore
			const result = ReportingEndpoints.encode({
				name: 'FAKE-1',
				url: undefined
			})
			assert.equal(result, undefined)
		})


		it('should handle a empty url string', () => {
			assert.throws(() => ReportingEndpoints.encode({
				name: 'FAKE',
				url: ''
			}), {
				name: 'TypeError',
				message: 'Invalid URL'
			})
		})

		it('should handle valid item', () => {
			const result = ReportingEndpoints.encode({
				name: 'FAKE-1',
				url: 'https://valid.intenral/'
			})
			assert.equal(result, 'FAKE-1="https://valid.intenral/"')
		})

		it('should handle valid item (via URL)', () => {
			const result = ReportingEndpoints.encode({
				name: 'FAKE-1',
				url: new URL('https://valid.intenral/path/')
			})
			assert.equal(result, 'FAKE-1="https://valid.intenral/path/"')
		})

		it('should handle valid single item array', () => {
			const result = ReportingEndpoints.encode([ {
				name: 'FAKE-1',
				url: 'https://reporting.internal'
			} ])
			assert.equal(result, 'FAKE-1="https://reporting.internal/"')
		})

		it('should handle multiple valid item array', () => {
			const result = ReportingEndpoints.encode([ {
				name: 'FAKE-1',
				url: 'https://fake1.internal'
			}, {
				name: 'FAKE-2',
				url: new URL('https://fake2.internal/path/file')
			} ])
			assert.equal(result, 'FAKE-1="https://fake1.internal/", FAKE-2="https://fake2.internal/path/file"')
		})

		it('should handle multiple valid item array skipping invalid', () => {
			const result = ReportingEndpoints.encode([ {
				name: 'FAKE-1',
				// @ts-ignore
				url: undefined
			}, {
				name: 'FAKE-2',
				url: new URL('https://fake2.internal/path/file')
			} ])
			assert.equal(result, 'FAKE-2="https://fake2.internal/path/file"')
		})
	})
})
