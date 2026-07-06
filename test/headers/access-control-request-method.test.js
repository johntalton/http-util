import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { AccessControlRequestMethod } from '@johntalton/http-util/headers'

describe('AccessControlRequestMethod', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = AccessControlRequestMethod.parse(undefined)
			assert.equal(result, undefined)
		})

    it('should handle empty string', () => {
			const result = AccessControlRequestMethod.parse('')
			assert.equal(result, undefined)
		})

    it('should throw on non string', () => {
			assert.throws(() => AccessControlRequestMethod.parse(42), {
        name: 'TypeError',
        message: 'parameter must be a string'
      })
		})

		it('should handle single item', () => {
			const result = AccessControlRequestMethod.parse('FAKE')
			assert.equal(result, 'FAKE')
		})

		it('should handle mixed case to upper', () => {
			const result = AccessControlRequestMethod.parse('FaKe')
			assert.equal(result, 'FAKE')
		})
  })
})
