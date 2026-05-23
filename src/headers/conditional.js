/** biome-ignore-all lint/nursery/noExcessiveClassesPerFile: includes helper classes */
/** biome-ignore-all lint/nursery/noExcessiveLinesPerFile: includes temporal and date support */
import { isQuoted, stripQuotes } from './util/quote.js'

/**
 * @typedef {Object} WeakEtagItem
 * @property {true} weak
 * @property {false} any
 * @property {string} etag
 */

/**
 * @typedef {Object} AnyEtagItem
 * @property {boolean} weak
 * @property {true} any
 * @property {'*'} etag
 */

/**
 * @typedef {Object} NotWeakEtagItem
 * @property {false} weak
 * @property {false} any
 * @property {string} etag
 */

/** @typedef {WeakEtagItem | NotWeakEtagItem | AnyEtagItem } EtagItem */

/**
 * @typedef {Object} IMFFixDateItem
 * @property {typeof DATE_DAYS[number]} dayName
 * @property {number} day
 * @property {typeof DATE_MONTHS[number]} month
 * @property {number} year
 * @property {number} hour
 * @property {number} minute
 * @property {number} second
 */

/**
 * @typedef {Object} IMFFixDateItemExtension
 * @property {Date|undefined} [date]
 * @property {Temporal.Instant|undefined} [instant]
 */

/** @typedef {IMFFixDateItem & IMFFixDateItemExtension} IMFFixDate */
/** @typedef {IMFFixDate|Date|Temporal.Instant|undefined} IMFFixDateInput */

export const FEATURE_TEMPORAL =  typeof Temporal !== 'undefined'

export const IMF_FIX_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	timeZone: 'UTC',
	weekday: 'short',
	year: 'numeric',
	month: 'short',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false
})

/**
 * @param {IMFFixDate|Date|Temporal.Instant|undefined} reference
 * @returns {reference is Temporal.Instant}
 */
export function isTemporalInstant(reference) {
	if(!FEATURE_TEMPORAL) { return false }
	return reference instanceof Temporal.Instant
}

export const CONDITION_ETAG_SEPARATOR = ','
export const CONDITION_ETAG_ANY = '*'
export const CONDITION_ETAG_WEAK_PREFIX = 'W/'
export const ETAG_QUOTE = '"'

/** @type {AnyEtagItem} */
export const ANY_ETAG_ITEM = { any: true, weak: false, etag: CONDITION_ETAG_ANY }

export const DATE_SPACE = ' '
export const DATE_DAYS = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ]
export const DATE_MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
export const DATE_SEPARATOR = ','
export const DATE_TIME_SEPARATOR = ':'
export const DATE_ZONE = 'GMT'

export const MINIMUM_YEAR = 1900
export const MAXIMUM_DAY = 31

/**
 * @deprecated
 * @see {@link ETag.isValid}
 * @param {string} etag
 */
export function isValidEtag(etag) {
	return ETag.isValid(etag)
}

export class ETag {
	/**
	 * @param {string} etag
	 */
	static isValid(etag) {
		// %x21 / %x23-7E  and %x80-FF
		for(const c of etag) {
			if(c.charCodeAt(0) < 0x21) { return false }
			if(c.charCodeAt(0) > 0xFF) { return false }
			if(c === ETAG_QUOTE) { return false }
		}
		return true
	}

	/**
	 * @param {string} etag
	 * @returns {WeakEtagItem}
	 */
	static weak(etag) {
		if(!ETag.isValid(etag)) { throw new Error('invalid etag format') }
		return { any: false, weak: true, etag }
	}

	/**
	 * @param {string} etag
	 * @returns {NotWeakEtagItem}
	 */
	static strong(etag) {
		if(!ETag.isValid(etag)) { throw new Error('invalid etag format') }
		return { any: false, weak: false, etag }
	}

	/**
	 * @returns {AnyEtagItem}
	 */
	static any() { return ANY_ETAG_ITEM }

	/**
	 * @param {string|undefined} raw
	 * @returns {EtagItem|undefined}
	 */
	static parse(raw) {
		if(raw === undefined) { return undefined }

		const rawEtag = raw.trim()
		const weak = rawEtag.startsWith(CONDITION_ETAG_WEAK_PREFIX)
		const quotedEtag = weak ? rawEtag.substring(CONDITION_ETAG_WEAK_PREFIX.length) : rawEtag

		if(quotedEtag === CONDITION_ETAG_ANY) { return ANY_ETAG_ITEM }

		if(!isQuoted(quotedEtag)) { return undefined }
		const etag = stripQuotes(quotedEtag)
		if(etag === undefined) { return undefined }
		if(!ETag.isValid(etag)) { return undefined }
		if(etag === CONDITION_ETAG_ANY) { return undefined }

		return {
			weak,
			any: false,
			etag
		}
	}
}

export class FixDate {

	/**
	 * True if {@link test} is after (exclusive) the {@link reference}
	 * (compares are seconds precision)
	 * @param {IMFFixDateInput} reference
	 * @param {IMFFixDateInput} test
	 * @returns {boolean}
	 */
	static isAfter(reference, test) {
		if(reference === undefined) { return false }
		if(test === undefined) { return false }

		if(FEATURE_TEMPORAL) {
			/** @type {Temporal.RoundingOptions<Temporal.TimeUnit>} */
			const precision = {
				smallestUnit: 'second',
				roundingMode: 'trunc'
			}

			const referenceInstant = FixDate.toInstant(reference)?.round(precision)
			const testInstant = FixDate.toInstant(test)?.round(precision)

			if(referenceInstant === undefined) { return false }
			if(testInstant === undefined) { return false }

			return Temporal.Instant.compare(referenceInstant, testInstant) === -1
		}

		//
		const referenceDate = FixDate.toDate(reference)
		const testDate = FixDate.toDate(test)

		if(referenceDate === undefined) { return false }
		if(testDate === undefined) { return false }

		referenceDate.setMilliseconds(0)
		testDate.setMilliseconds(0)

		return testDate > referenceDate
	}

	/**
	 * @param {IMFFixDateInput} reference
	 * @returns {Temporal.Instant|undefined}
	 */
	static toInstant(reference) {
		if(!FEATURE_TEMPORAL) { return undefined }
		if(reference === undefined) { return undefined }

		if(isTemporalInstant(reference)) { return reference }
		if(reference instanceof Date) { return reference.toTemporalInstant() }

		if(reference.instant !== undefined) { return reference.instant }
		if(reference.date !== undefined) { return reference.date.toTemporalInstant() }

		const { year, month, day, hour, minute, second } = reference

		const zdt = Temporal.ZonedDateTime.from({
			year,
			month: DATE_MONTHS.indexOf(month) + 1,
			day,
			hour,
			minute,
			second,
			timeZone: 'UTC'
		})

		return zdt.toInstant()
	}

	/**
	 * @param {IMFFixDateInput} reference
	 * @returns {Date|undefined}
	 */
	static toDate(reference) {
		if(reference === undefined) { return undefined }

		if(reference instanceof Date) { return reference }
		if(isTemporalInstant(reference)) { return new Date(reference.epochMilliseconds) }

		if(FEATURE_TEMPORAL && (reference.instant !== undefined)) { return new Date(reference.instant.epochMilliseconds) }
		if(reference.date !== undefined) { return reference.date }

		const { year, month, day, hour, minute, second } = reference
		return new Date(Date.UTC(year, DATE_MONTHS.indexOf(month), day, hour, minute, second))
	}
}

export class Conditional {
	/**
	 * @param {EtagItem|undefined} etagItem
	 * @returns {string|undefined}
	 */
	static encodeEtag(etagItem) {
		if(etagItem === undefined) { return undefined }
		if(etagItem.any) {
			if(etagItem.etag !== CONDITION_ETAG_ANY) { return undefined }
			return CONDITION_ETAG_ANY
		}

		if(etagItem.etag === CONDITION_ETAG_ANY) { return undefined }
		if(!ETag.isValid(etagItem.etag)) { return undefined }

		const prefix = etagItem.weak ? CONDITION_ETAG_WEAK_PREFIX : ''
		return `${prefix}${ETAG_QUOTE}${etagItem.etag}${ETAG_QUOTE}`
	}

	/**
	 * @param {string|undefined} matchHeader
	 * @returns {Array<EtagItem>}
	 */
	static parseEtagList(matchHeader) {
		if(matchHeader === undefined) { return [] }

		return matchHeader.split(CONDITION_ETAG_SEPARATOR)
			.map(ETag.parse)
			.filter(item => item !== undefined)
	}

	/**
	 * @param {Array<EtagItem>} etagItemList
	 */
	static hasAny(etagItemList) {
		return etagItemList.find(item => item.any) !== undefined
	}

	/**
	 * @param {Array<EtagItem>} etagItemList
	 * @param {string} etag
	 */
	static hasEtag(etagItemList, etag) {
		return etagItemList.find(item => item.etag === etag) !== undefined
	}

	/**
	 * @param {IMFFixDateInput|string|undefined} reference
	 * @returns {string|undefined}
	 */
	static encodeFixDate(reference) {
		if(reference === undefined) { return undefined }

		if(typeof reference === 'string') { return reference }
		if(reference instanceof Date) { return reference.toUTCString() }
		if(isTemporalInstant(reference)) {

			const parts = IMF_FIX_DATE_FORMATTER.formatToParts(reference)
			const m = new Map(parts.map(p => [ p.type, p.value ]))
			const weekday = m.get('weekday') ?? 'ERR'
			const day = m.get('day') ?? '00'
			const month = m.get('month') ?? '00'
			const year = m.get('year') ?? '0000'
			const hour = m.get('hour') ?? '00'
			const minute = m.get('minute') ?? '00'
			const second = m.get('second') ?? '00'

			return `${weekday}, ${day} ${month} ${year} ${hour}:${minute}:${second} ${DATE_ZONE}`
		}

		if(reference.date !== undefined) { return reference.date.toUTCString() }

		const { year, month, day, hour, minute, second } = reference
		const d = new Date(Date.UTC(year, DATE_MONTHS.indexOf(month), day, hour, minute, second))
		return d.toUTCString()
	}

	/**
	 * @param {String|string|undefined} matchHeader
	 * @returns {IMFFixDate|undefined}
	 */
	static parseFixDate(matchHeader) {
		if(matchHeader === undefined || matchHeader === null) { return undefined }
		// if(!(typeof matchHeader === 'string') && (!(matchHeader instanceof String))) { return undefined }

		// https://www.rfc-editor.org/rfc/rfc5322.html#section-3.3
		// https://httpwg.org/specs/rfc9110.html#preferred.date.format
		// <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
		// day-name "," SP date1 SP time-of-day SP GMT

		if(matchHeader.length !== 29) { return undefined }

		//
		const spaces = [
			matchHeader.substring(4, 5),
			matchHeader.substring(7, 8),
			matchHeader.substring(11, 12),
			matchHeader.substring(16, 17),
			matchHeader.substring(25, 26)
		]
		const comma = matchHeader.substring(3, 4)
		const timeSeparators = [
			matchHeader.substring(19, 20),
			matchHeader.substring(22, 23)
		]
		const gmt = matchHeader.substring(26)

		//
		if(comma !== DATE_SEPARATOR) { return undefined }
		if(gmt !== DATE_ZONE) { return undefined }
		for(const colon of timeSeparators) {
			if(colon !== DATE_TIME_SEPARATOR) { return undefined }
		}
		for(const space of spaces) {
			if(space !== DATE_SPACE) { return undefined }
		}

		//
		const dayName = matchHeader.substring(0, 3)
		const day = Number.parseInt(matchHeader.substring(5, 7))
		const month = matchHeader.substring(8, 11)
		const year = Number.parseInt(matchHeader.substring(12, 16))
		const hour = Number.parseInt(matchHeader.substring(17, 19))
		const minute = Number.parseInt(matchHeader.substring(20, 22))
		const second = Number.parseInt(matchHeader.substring(23, 25))

		//
		if(!DATE_DAYS.includes(dayName)) { return undefined }
		if(!DATE_MONTHS.includes(month)) { return undefined }
		if(!Number.isInteger(day)) { return undefined }
		if(!Number.isInteger(year)) { return undefined }
		if(!Number.isInteger(hour)) { return undefined }
		if(!Number.isInteger(minute)) { return undefined }
		if(!Number.isInteger(second)) { return undefined }

		//
		if(day > MAXIMUM_DAY || day <= 0) { return undefined }
		if(year < MINIMUM_YEAR) { return undefined }
		if(hour > 24 || hour < 0) { return undefined }
		if(minute > 60 || minute < 0) { return undefined }
		if(second > 60 || second < 0) { return undefined }

		const fixDate = {
			dayName,
			day,
			month,
			year,
			hour,
			minute,
			second
		}

		//
		return {
			...fixDate,
			date: FixDate.toDate(fixDate),
			instant: FixDate.toInstant(fixDate)
		}
	}
}


// const fd = Conditional.encodeFixDate(Temporal.Now.instant())
// console.log(fd, Conditional.parseFixDate(fd))

// Ok
// console.log(Conditional.encodeEtag({ any: true, weak: false, etag: '*' }))
// console.log(Conditional.encodeEtag({ any: true, weak: true, etag: '*' }))
// console.log(Conditional.encodeEtag({ any: false, weak: false, etag: 'Foo' }))
// console.log(Conditional.encodeEtag({ any: false, weak: true, etag: 'WeakFoo' }))

// Error
// console.log(Conditional.encodeEtag(undefined))
// console.log(Conditional.encodeEtag({ any: true, weak: false, etag: 'NotAsterisk' }))
// console.log(Conditional.encodeEtag({ any: false, weak: false, etag: 'Foo\tBar' }))
// console.log(Conditional.encodeEtag({ any: false, weak: false, etag: 'Foo"Bar' }))
// console.log(Conditional.encodeEtag({ any: false, weak: false, etag: '*' }))


// Ok
// console.log(Conditional.parseEtagList('"bfc13a64729c4290ef5b2c2730249c88ca92d82d"'))
// console.log(Conditional.parseEtagList('W/"67ab43", "54ed21", "7892dd"'))
// console.log(Conditional.parseEtagList('*'))
// console.log(Conditional.parseEtagList('"!ÿ©"'))
// console.log(Conditional.parseEtagList('"!","ÿ", "©"'))
// console.log(Conditional.parseEtagList('"!","ÿ"   ,\t"©"'))

// Error
// console.log(Conditional.parseEtagList('"*"'))
// console.log(Conditional.parseEtagList('W/'))
// console.log(Conditional.parseEtagList('W/"'))
// console.log(Conditional.parseEtagList('W/""'))
// console.log(Conditional.parseEtagList(''))
// console.log(Conditional.parseEtagList('"'))
// console.log(Conditional.parseEtagList('""'))
// console.log(Conditional.parseEtagList('"""'))
// console.log(Conditional.parseEtagList('" "'))
// console.log(Conditional.parseEtagList('"\n"'))
// console.log(Conditional.parseEtagList('"\t"'))

//
// const testsOk = [
// 	'Sun, 06 Nov 1994 08:49:37 GMT',
// 	'Sun, 06 Nov 1994 00:00:00 GMT',
// 	'Tue, 01 Nov 1994 00:00:00 GMT',
// 	'Thu, 06 Nov 3000 08:49:37 GMT',
// 	'Sun, 06 Nov 1994 23:59:59 GMT',
// 	new String('Sun, 06 Nov 1994 08:49:37 GMT'),
// ]
// for(const test of testsOk) {
// 	const result = Conditional.parseFixDate(test)
// 	if(result?.date.toUTCString() !== test.toString()) {
// 		console.log('🛑', test, result, result?.date.toUTCString())
// 		break
// 	}
// }



// const testBad = [
// 	undefined,
// 	null,
// 	{},
// 	new String(),
// 	'',
// 	'Anything',
// 	'   ,               :  :   GMT',
// 	'Sun,    Nov        :  :   GMT',
// 	'Sun, 00 Nov 0000 00:00:00 GMT',
// 	'Sun, 06 Nov 1994 08-49-37 GMT',
// 	'Sun  06 Nov 1994 08:49:37 GMT',
// 	'FOO, 06 Nov 1994 08:49:37 GMT',
// 	'Sun, 32 Nov 1994 08:49:37 GMT',
// 	'Sun, 00 Nov 1994 08:49:37 GMT',
// 	'Sun, 06 Nov 0900 08:49:37 GMT',
// 	'Sun, 06 Nov 1994 08:49:37 UTC',
// 	'Sun, 06 Nov 1994 30:49:37 GMT',
// 	'Sun,\t06 Nov 1994 08:49:37 GMT',

// 	'Sunday, 06-Nov-94 08:49:37 GMT',
// 	'Sun Nov  6 08:49:37 1994',
// 	'Sun Nov  6 08:49:37 1994      ',

// ]
// for(const test of testBad) {
// 	const result = Conditional.parseFixDate(test)
// 	if(result !== undefined) {
// 		console.log('🛑', test, result)
// 		break
// 	}
// }

