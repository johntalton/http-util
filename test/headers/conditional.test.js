import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Conditional, ETag } from '@johntalton/http-util/headers'


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
			assert.throws(() => { ETag.weak('INVALID ETAG') }, {
				name: 'TypeError',
				message: 'invalid etag format'
			})
		})

		it('should handle valid', () => {
			const result = ETag.weak('THIS-IS-OK')
			assert.deepEqual(result, { any: false, weak: true, etag: 'THIS-IS-OK' })
		})
	})

	describe('strong', () => {
		it('should throw on undefined', () => {
			assert.throws(() => { ETag.strong('INVALID ETAG') }, {
				name: 'TypeError',
				message: 'invalid etag format'
			})
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

describe('Conditional', () => {
	describe('encodeEtag', () => {
		it('should handle undefined', () => {
			const result = Conditional.encodeEtag(undefined)
			assert.equal(result, undefined)
		})

		it('should handle any', () => {
			const result = Conditional.encodeEtag({ any: true, etag: '*', weak: false })
			assert.equal(result, '*')
		})

		it('should reject any with improper etag', () => {
			const result = Conditional.encodeEtag({ any: true, etag: 'FAKE', weak: false })
			assert.equal(result, undefined)
		})

		it('should reject any with improper any', () => {
			const result = Conditional.encodeEtag({ any: false, etag: '*', weak: false })
			assert.equal(result, undefined)
		})

		it('should reject invalid etag', () => {
			const result = Conditional.encodeEtag({ any: false, etag: 'With Space', weak: false })
			assert.equal(result, undefined)
		})

		it('should handle valid etag', () => {
			const result = Conditional.encodeEtag({ any: false, etag: 'VALID_TAG', weak: false })
			assert.equal(result, '"VALID_TAG"')
		})

		it('should handle valid weak etag', () => {
			const result = Conditional.encodeEtag({ any: false, etag: 'VALID_TAG', weak: true })
			assert.equal(result, 'W/"VALID_TAG"')
		})
	})

	describe('parseEtagList', () => {
		it('should handle undefined', () => {
			const result = Conditional.parseEtagList(undefined)
			assert.deepEqual(result, [])
		})

		it('should handle empty string', () => {
			const result = Conditional.parseEtagList('')
			assert.deepEqual(result, [])
		})

		it('should handle empty string with quotes', () => {
			const result = Conditional.parseEtagList('""')
			assert.deepEqual(result, [])
		})

		it('should handle ANY', () => {
			const result = Conditional.parseEtagList('*')
			assert.deepEqual(result, [
				{ weak: false, any: true, etag: '*' }
			])
		})

		it('should handle list', () => {
			const result = Conditional.parseEtagList('"FOO","BAR",W/"BIZ"')
			assert.deepEqual(result, [
				{ weak: false, any: false, etag: 'FOO' },
				{ weak: false, any: false, etag: 'BAR' },
				{ weak: true, any: false, etag: 'BIZ' }
			])
		})

		it('should handle list drop invalid', () => {
			const result = Conditional.parseEtagList('FOOBAR,W/"BIZ"')
			assert.deepEqual(result, [
				{ weak: true, any: false, etag: 'BIZ' }
			])
		})

		it('should handle list with ANY', () => {
			const result = Conditional.parseEtagList('"FOO",*,W/"BIZ"')
			assert.deepEqual(result, [
				{ weak: false, any: false, etag: 'FOO' },
				{ weak: false, any: true, etag: '*' },
				{ weak: true, any: false, etag: 'BIZ' }
			])
		})
	})

	describe('hasAny', () => {
		it('should handle undefined', () => {
			const result = Conditional.hasAny(undefined)
			assert.equal(result, false)
		})

		it('should handle empty list', () => {
			const result = Conditional.hasAny([])
			assert.equal(result, false)
		})

		it('should handle non-ANY list', () => {
			const result = Conditional.hasAny([
				{ weak: false, any: false, etag: 'TESTING1' },
				{ weak: false, any: false, etag: 'TESTING2' }
			])
			assert.equal(result, false)
		})

		it('should handle list with ANY', () => {
			const result = Conditional.hasAny([
				{ weak: false, any: false, etag: 'TESTING1' },
				{ weak: false, any: true, etag: '*' },
				{ weak: false, any: false, etag: 'TESTING2' },
			])
			assert.equal(result, true)
		})
	})

	describe('hasEtag', () => {
		it('should handle undefined list', () => {
			const result = Conditional.hasEtag(undefined, undefined)
			assert.equal(result, false)
		})

		it('should handle undefined etag', () => {
			const result = Conditional.hasEtag([], undefined)
			assert.equal(result, false)
		})

		it('should handle etag not found', () => {
			const result = Conditional.hasEtag([
				{ weak: true, any: false, etag: 'NOT_TESTING' }
			], 'TESTING')
			assert.equal(result, false)
		})

		it('should handle etag found', () => {
			const result = Conditional.hasEtag([
				{ weak: true, any: false, etag: 'TESTING' }
			], 'TESTING')
			assert.equal(result, true)
		})
	})
})
