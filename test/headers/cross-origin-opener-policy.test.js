import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CrossOriginOpenerPolicy } from '@johntalton/http-util/headers'

describe('CrossOriginOpenerPolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = CrossOriginOpenerPolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle bad value', () => {
			assert.throws(() => CrossOriginOpenerPolicy.encode('fake'), {
				name: 'TypeError',
				message: 'Invalid COOP Directive'
			})
		})

		it('should handle defaults', () => {
			const result = CrossOriginOpenerPolicy.encode('same-origin')
			assert.equal(result, 'same-origin')
		})
	})
})
