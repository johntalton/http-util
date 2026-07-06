import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { AccessControlRequestHeaders } from '@johntalton/http-util/headers'

describe('AccessControlRequestHeaders', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = AccessControlRequestHeaders.parse(undefined)
			assert.deepEqual(result, undefined)
		})

    it('should handle empty string', () => {
			const result = AccessControlRequestHeaders.parse('')
			assert.deepEqual(result, undefined)
		})

    it('should throw on non string', () => {
			assert.throws(() => AccessControlRequestHeaders.parse(42), {
        name: 'TypeError',
        message: 'parameter must be a string'
      })
		})

		it('should handle single item', () => {
			const result = AccessControlRequestHeaders.parse('FAKE')
			assert.deepEqual(result, [ 'FAKE' ])
		})

		it('should handle list of items', () => {
			const result = AccessControlRequestHeaders.parse('FAKE1, FAKE2')
			assert.deepEqual(result, [ 'FAKE1', 'FAKE2' ])
		})
  })
})
