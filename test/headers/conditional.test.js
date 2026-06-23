import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Conditional, ETag, FixDate, FEATURE_TEMPORAL } from '@johntalton/http-util/headers'

// const DATE_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

const EXAMPLE_DATE_EARLY =  new Date(Date.UTC(2000, 2, 15, 1, 0, 0, 0))
const EXAMPLE_DATE_MIDDLE = new Date(Date.UTC(2001, 0,  1, 0, 0, 0, 0))
const EXAMPLE_DATE_LATE =   new Date(Date.UTC(2020, 1,  1, 0, 0, 0, 0))

const EXAMPLE_TEMPORAL_EARLY =  FEATURE_TEMPORAL ? Temporal.PlainDateTime.from('2000-03-15T01:00:00').toZonedDateTime('UTC').toInstant() : undefined
const EXAMPLE_TEMPORAL_MIDDLE = FEATURE_TEMPORAL ? Temporal.PlainDateTime.from('2001-01-01T00:00:00').toZonedDateTime('UTC').toInstant() : undefined
const EXAMPLE_TEMPORAL_LATE =   FEATURE_TEMPORAL ? Temporal.PlainDateTime.from('2020-02-01T00:00:00').toZonedDateTime('UTC').toInstant() : undefined

const EXAMPLE_IMF_EARLY = { dayName: '', year: 2000, month: 'Mar', day: 15, hour: 0, minute: 0, second: 0 }
const EXAMPLE_IMF_MIDDLE = { dayName: '', year: 2001, month: 'Jan', day: 1, hour: 0, minute: 0, second: 0 }
const EXAMPLE_IMF_LATE = { dayName: '', year: 2020, month: 'Feb', day: 1, hour: 0, minute: 0, second: 0 }

const EXAMPLE_IMF_INSTANT_EARLY = { ...EXAMPLE_IMF_EARLY, instant: EXAMPLE_TEMPORAL_EARLY }
const EXAMPLE_IMF_INSTANT_MIDDLE = { ...EXAMPLE_IMF_MIDDLE, instant: EXAMPLE_TEMPORAL_MIDDLE }
const EXAMPLE_IMF_INSTANT_LATE = { ...EXAMPLE_IMF_LATE, instant: EXAMPLE_TEMPORAL_LATE }

const EXAMPLE_IMF_DATE_EARLY = { ...EXAMPLE_IMF_EARLY, date: EXAMPLE_DATE_EARLY }
const EXAMPLE_IMF_DATE_MIDDLE = { ...EXAMPLE_IMF_MIDDLE, date: EXAMPLE_DATE_MIDDLE }
const EXAMPLE_IMF_DATE_LATE = { ...EXAMPLE_IMF_LATE, date: EXAMPLE_DATE_LATE }

const EXAMPLE_STRING_MIDDLE = 'Mon, 01 Jan 2001 00:00:00 GMT'


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
		it('should handle undefined reference', () => {
			const result = FixDate.isAfter(undefined, undefined)
			assert.equal(result, false)
		})

		it('should handle undefined test', () => {
			const result = FixDate.isAfter(new Date(), undefined)
			assert.equal(result, false)
		})

		it('should handle date after valid', () => {
			const result = FixDate.isAfter(EXAMPLE_DATE_EARLY, EXAMPLE_DATE_LATE)
			assert.equal(result, true)
		})

		it('should handle date before valid', () => {
			const result = FixDate.isAfter(EXAMPLE_DATE_LATE, EXAMPLE_DATE_EARLY)
			assert.equal(result, false)
		})

		it('should handle same date as before', () => {
			const result = FixDate.isAfter(EXAMPLE_DATE_MIDDLE, EXAMPLE_DATE_MIDDLE)
			assert.equal(result, false)
		})
	})

	describe('toInstant', () => {
		it('should handle undefined', () => {
			const result = FixDate.toInstant(undefined)
			assert.equal(result, undefined)
		})

		if(FEATURE_TEMPORAL) {
			it('should handle instant', () => {
				const result = FixDate.toInstant(EXAMPLE_TEMPORAL_MIDDLE)
				assert.ok(result?.equals(EXAMPLE_TEMPORAL_MIDDLE))
			})

			it('should handle date', () => {
				const result = FixDate.toInstant(EXAMPLE_DATE_MIDDLE)
				assert.ok(result?.equals(EXAMPLE_TEMPORAL_MIDDLE))
			})

			it('should handle IMF', () => {
				const result = FixDate.toInstant(EXAMPLE_IMF_MIDDLE)
				assert.ok(result?.equals(EXAMPLE_TEMPORAL_MIDDLE))
			})

			it('should handle IMF with instant', () => {
				const result = FixDate.toInstant(EXAMPLE_IMF_INSTANT_MIDDLE)
				assert.ok(result?.equals(EXAMPLE_TEMPORAL_MIDDLE))
			})

			it('should handle IMF with date', () => {
				const result = FixDate.toInstant(EXAMPLE_IMF_DATE_MIDDLE)
				assert.ok(result?.equals(EXAMPLE_TEMPORAL_MIDDLE))
			})
		}
	})

	describe('toDate', () => {
		it('should handle undefined', () => {
			const result = FixDate.toDate(undefined)
			assert.equal(result, undefined)
		})

		if(FEATURE_TEMPORAL) {
			it('should handle instant', () => {
				const result = FixDate.toDate(EXAMPLE_TEMPORAL_MIDDLE)
				assert.ok(result?.getTime() === EXAMPLE_DATE_MIDDLE.getTime())
			})
		}

		it('should handle date', () => {
			const result = FixDate.toDate(EXAMPLE_DATE_MIDDLE)
			assert.ok(result?.getTime() === EXAMPLE_DATE_MIDDLE.getTime())
		})

		it('should handle IMF', () => {
			const result = FixDate.toDate(EXAMPLE_IMF_MIDDLE)
			assert.ok(result?.getTime() === EXAMPLE_DATE_MIDDLE.getTime())
		})

		it('should handle IMF with instant', () => {
			const result = FixDate.toDate(EXAMPLE_IMF_INSTANT_MIDDLE)
			assert.ok(result?.getTime() === EXAMPLE_DATE_MIDDLE.getTime())
		})

		it('should handle IMF with date', () => {
			const result = FixDate.toDate(EXAMPLE_IMF_DATE_MIDDLE)
			assert.ok(result?.getTime() === EXAMPLE_DATE_MIDDLE.getTime())
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

		it('should reject any with improper anyt', () => {
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

	describe('encodeFixDate', () => {
		it('should handle undefined', () => {
			const result = Conditional.encodeFixDate(undefined)
			assert.equal(result, undefined)
		})

		it('should handle echo strings', () => {
			const result = Conditional.encodeFixDate('TESTING')
			assert.equal(result, 'TESTING')
		})

		it('should handle Date', () => {
			const result = Conditional.encodeFixDate(EXAMPLE_DATE_MIDDLE)
			assert.equal(result, EXAMPLE_STRING_MIDDLE)
		})

		if(FEATURE_TEMPORAL) {
			it('should handle Temporal', () => {
				const result = Conditional.encodeFixDate(EXAMPLE_TEMPORAL_MIDDLE)
				assert.equal(result, EXAMPLE_STRING_MIDDLE)
			})
		}

		it('should handle IMF', () => {
			const result = Conditional.encodeFixDate(EXAMPLE_IMF_MIDDLE)
			assert.equal(result, EXAMPLE_STRING_MIDDLE)
		})
	})

	describe('parseFixDate', () => {
		it('should handle undefined', () => {
			const result = Conditional.parseFixDate(undefined)
			assert.equal(result, undefined)
		})

		it('should throw on null', () => {
			assert.throws(() => Conditional.parseFixDate(null), {
				name: 'TypeError',
				message: 'parameter must be a string'
			})
		})

		it('should reject improper length', () => {
			const result = Conditional.parseFixDate('')
			assert.equal(result, undefined)
		})

		it('should reject improper separator', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace(',', 'X'))
			assert.equal(result, undefined)
		})

		it('should reject gmt separator', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('GMT', 'UTC'))
			assert.equal(result, undefined)
		})

		it('should reject colon separator', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace(':', 'X'))
			assert.equal(result, undefined)
		})

		it('should reject space separator', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace(' ', 'X'))
			assert.equal(result, undefined)
		})

		it('should reject invalid month names', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('Jan', 'FOO'))
			assert.equal(result, undefined)
		})

		it('should reject invalid day names', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('Mon', 'FOO'))
			assert.equal(result, undefined)
		})

		it('should reject invalid hour value', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('00:00:00', 'XX:00:00'))
			assert.equal(result, undefined)
		})

		it('should reject invalid year value (out of range)', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('2001', '1700'))
			assert.equal(result, undefined)
		})

		it('should reject invalid day value (out of range)', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace(', 01', ', 40'))
			assert.equal(result, undefined)
		})

		it('should reject invalid hour value (out of range)', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('00:00:00', '99:00:00'))
			assert.equal(result, undefined)
		})

		it('should reject invalid min value (out of range)', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('00:00:00', '00:61:00'))
			assert.equal(result, undefined)
		})

		it('should reject invalid sec value (out of range)', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE.replace('00:00:00', '00:00:-1'))
			assert.equal(result, undefined)
		})

		it('should handle valid', () => {
			const result = Conditional.parseFixDate(EXAMPLE_STRING_MIDDLE)
			assert.deepEqual(result, {
				date: new Date('2001-01-01T00:00:00.000Z'),
				day: 1,
				dayName: 'Mon',
				hour: 0,
				instant: FEATURE_TEMPORAL ? Temporal.Instant.from('2001-01-01T00:00:00.000Z') : undefined,
				minute: 0,
				month: 'Jan',
				second: 0,
				year: 2001
			})
		})
	})
})
