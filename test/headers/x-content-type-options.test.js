import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ContentTypeOptions } from '@johntalton/http-util/headers'

describe('ContentTypeOptions', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ContentTypeOptions.encode(undefined)
			assert.deepEqual(result, undefined)
		})

		it('should handle default', () => {
			const result = ContentTypeOptions.encode()
			assert.deepEqual(result, undefined)
		})

		it('should handle false', () => {
			const result = ContentTypeOptions.encode(false)
			assert.deepEqual(result, undefined)
		})

		it('should handle true', () => {
			const result = ContentTypeOptions.encode(true)
			assert.deepEqual(result, 'nosniff')
		})
	})
})
