import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Conditional, ETag, FixDate } from '@johntalton/http-util/headers'

describe('ETag', () => {
	describe('isValid', () => {
		it('should handle undefined', () => {
			const result = ETag.isValid(undefined)
			assert.equal(result, false)
		})

		it('should handle valid', () => {
			const result = ETag.isValid('THIS-IS-OK')
			assert.equal(result, true)
		})

		it('should handle invalid', () => {
			const result = ETag.isValid('THIS IS NOT OK')
			assert.equal(result, false)
		})
	})

	describe('weak', () => {
		it('should throw on undefined', () => {
			assert.throws(() => { ETag.weak('INVALID ETAG') })
		})

		it('should handle valid', () => {
			const result = ETag.weak('THIS-IS-OK')
			assert.deepEqual(result, { any: false, weak: true, etag: 'THIS-IS-OK' })
		})
	})

	describe('strong', () => {
		it('should throw on undefined', () => {
			assert.throws(() => { ETag.strong('INVALID ETAG') })
		})

		it('should handle valid', () => {
			const result = ETag.strong('THIS-IS-OK')
			assert.deepEqual(result, { any: false, weak: false, etag: 'THIS-IS-OK' })
		})
	})

	describe('any', () => {
		it('should return any', () => {
			const result = ETag.any()
			assert.deepEqual(result, { any: true, weak: false, etag: '*' })
		})
	})

	describe('parse', () => {
		it('should handle undefined', () => {
			const result = ETag.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should reject unquoted', () => {
			const result = ETag.parse('NOT-QUOTED-BUT-OK')
			assert.equal(result, undefined)
		})

		it('should reject empty quotes', () => {
			const result = ETag.parse('""')
			assert.equal(result, undefined)
		})

		it('should reject empty invalid', () => {
			const result = ETag.parse('"NOT A VALID TAG"')
			assert.equal(result, undefined)
		})

		it('should handle valid (weak)', () => {
			const result = ETag.parse('W/"SOME-TAG"')
			assert.deepEqual(result, { any: false, weak: true, etag: 'SOME-TAG' })
		})

		it('should handle valid (strong)', () => {
			const result = ETag.parse('"SOME-TAG"')
			assert.deepEqual(result, { any: false, weak: false, etag: 'SOME-TAG' })
		})

		it('should handle valid (any)', () => {
			const result = ETag.parse('*')
			assert.deepEqual(result, { any: true, weak: false, etag: '*' })
		})

		it('should handle valid (any quoted)', () => {
			const result = ETag.parse('"*"')
			assert.deepEqual(result, { any: true, weak: false, etag: '*' })
		})
	})
})

describe('FixDate', () => {
	describe('isAfter', () => {
		it('should handle undefined', () => {
		})
	})

	describe('toInstant', () => {
		it('should handle undefined', () => {
		})
	})

	describe('toDate', () => {
		it('should handle undefined', () => {
		})
	})
})


describe('Conditional', () => {
	describe('encodeEtag', () => {
		it('should handle undefined', () => {
		})
	})

	describe('parseEtagList', () => {
		it('should handle undefined', () => {
		})
	})

	describe('hasAny', () => {
		it('should handle undefined', () => {
		})
	})

	describe('encodeFixDate', () => {
		it('should handle undefined', () => {
		})
	})

	describe('parseFixDate', () => {
		it('should handle undefined', () => {
		})
	})
})
