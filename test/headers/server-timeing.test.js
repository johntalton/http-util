import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ServerTiming } from '@johntalton/http-util/headers'

describe('ServerTiming', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ServerTiming.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty array', () => {
			const result = ServerTiming.encode([])
			assert.equal(result, undefined)
		})

		it('should handle item (undef duration)', () => {
			const result = ServerTiming.encode([ { name: 'TEST', duration: undefined  } ])
			assert.equal(result, 'TEST')
		})

		it('should handle item', () => {
			const result = ServerTiming.encode([ { name: 'TEST', duration: 42  } ])
			assert.equal(result, 'TEST;dur=42')
		})

		it('should handle multiple item', () => {
			const result = ServerTiming.encode([
				{ name: 'A', duration: 42  },
				{ name: 'B', duration: 77  },
			])
			assert.equal(result, 'A;dur=42,B;dur=77')
		})

		it('should handle item with description', () => {
			const result = ServerTiming.encode([
				{ name: 'TEST', duration: 42, description: 'A TEST'  }])
			assert.equal(result, 'TEST;desc="A TEST";dur=42')
		})

		it('should handle item and truncate duration to one digits', () => {
			const result = ServerTiming.encode([ { name: 'TEST', duration: 42.1234  } ])
			assert.equal(result, 'TEST;dur=42.1')
		})
	})
})
