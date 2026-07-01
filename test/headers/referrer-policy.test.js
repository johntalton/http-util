import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ReferrerPolicy } from '@johntalton/http-util/headers'

describe('ReferrerPolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ReferrerPolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle invalid directive', () => {
			assert.throws(() => ReferrerPolicy.encode('FAKE'), {
				name: 'TypeError',
				message: 'Invalid Referrer Policy Directive'
			})
		})

		it('should handle undefined', () => {
			const result = ReferrerPolicy.encode('same-origin')
			assert.equal(result, 'same-origin')
		})
	})
})
