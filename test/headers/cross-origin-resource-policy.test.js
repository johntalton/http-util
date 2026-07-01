import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CrossOriginResourcePolicy } from '@johntalton/http-util/headers'

describe('CrossOriginResourcePolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = CrossOriginResourcePolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle bad directive', () => {
			assert.throws(() => CrossOriginResourcePolicy.encode('FAKE'), {
				name: 'TypeError',
				message: 'Invalid CORP Directive'
			})
		})

		it('should handle default', () => {
			const result = CrossOriginResourcePolicy.encode('cross-origin')
			assert.equal(result, 'cross-origin')
		})

	})
})
