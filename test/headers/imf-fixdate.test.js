import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { InternetMessageFormatFixDate, FixDate } from '@johntalton/http-util/util'

import { FEATURE_TEMPORAL } from '@johntalton/http-util/util'

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

describe('InternetMessageFormatFixDate', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = InternetMessageFormatFixDate.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle echo strings', () => {
			const result = InternetMessageFormatFixDate.encode('TESTING')
			assert.equal(result, 'TESTING')
		})

		it('should handle Date', () => {
			const result = InternetMessageFormatFixDate.encode(EXAMPLE_DATE_MIDDLE)
			assert.equal(result, EXAMPLE_STRING_MIDDLE)
		})

		if(FEATURE_TEMPORAL) {
			it('should handle Temporal', () => {
				const result = InternetMessageFormatFixDate.encode(EXAMPLE_TEMPORAL_MIDDLE)
				assert.equal(result, EXAMPLE_STRING_MIDDLE)
			})
		}

		it('should handle IMF', () => {
			const result = InternetMessageFormatFixDate.encode(EXAMPLE_IMF_MIDDLE)
			assert.equal(result, EXAMPLE_STRING_MIDDLE)
		})
	})

	describe('parse', () => {
		it('should handle undefined', () => {
			const result = InternetMessageFormatFixDate.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should throw on null', () => {
			assert.throws(() => InternetMessageFormatFixDate.parse(null), {
				name: 'TypeError',
				message: 'parameter must be a string'
			})
		})

		it('should reject improper length', () => {
			const result = InternetMessageFormatFixDate.parse('')
			assert.equal(result, undefined)
		})

		it('should reject improper separator', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace(',', 'X'))
			assert.equal(result, undefined)
		})

		it('should reject gmt separator', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('GMT', 'UTC'))
			assert.equal(result, undefined)
		})

		it('should reject colon separator', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace(':', 'X'))
			assert.equal(result, undefined)
		})

		it('should reject space separator', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace(' ', 'X'))
			assert.equal(result, undefined)
		})

		it('should reject invalid month names', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('Jan', 'FOO'))
			assert.equal(result, undefined)
		})

		it('should reject invalid day names', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('Mon', 'FOO'))
			assert.equal(result, undefined)
		})

		it('should reject invalid hour value', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('00:00:00', 'XX:00:00'))
			assert.equal(result, undefined)
		})

		it('should reject invalid year value (out of range)', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('2001', '1700'))
			assert.equal(result, undefined)
		})

		it('should reject invalid day value (out of range)', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace(', 01', ', 40'))
			assert.equal(result, undefined)
		})

		it('should reject invalid hour value (out of range)', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('00:00:00', '99:00:00'))
			assert.equal(result, undefined)
		})

		it('should reject invalid min value (out of range)', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('00:00:00', '00:61:00'))
			assert.equal(result, undefined)
		})

		it('should reject invalid sec value (out of range)', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE.replace('00:00:00', '00:00:-1'))
			assert.equal(result, undefined)
		})

		it('should handle valid', () => {
			const result = InternetMessageFormatFixDate.parse(EXAMPLE_STRING_MIDDLE)
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