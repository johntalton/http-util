export const CONDITION_ETAG_SEPARATOR = ','
export const CONDITION_ETAG_ANY = '*'
export const CONDITION_ETAG_WEAK_PREFIX = 'W/'
export const ETAG_QUOTE = '"'

export const DATE_SPACE = ' '
export const DATE_DAYS = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ]
export const DATE_MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
export const DATE_SEPARATOR = ','
export const DATE_TIME_SEPARATOR = ':'
export const DATE_ZONE = 'GMT'

/**
 * @param {string} etag
 */
export function isValidEtag(etag) {
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
 */
export function stripQuotes(etag) {
	return etag.substring(1, etag.length - 1)
}

/**
 * @param {string} etag
 */
export function isQuoted(etag) {
	if(etag.length <= 2) { return false }
	if(!etag.startsWith(ETAG_QUOTE)) { return false }
	if(!etag.endsWith(ETAG_QUOTE)) { return false }
	return true
}

/**
 * @typedef {Object} EtagItem
 * @property {boolean} weak
 * @property {boolean} any
 * @property {string} etag
 */

/**
 * @typedef {Object} IMFFixDate
 * @property {typeof DATE_DAYS[number]} dayName
 * @property {number} day
 * @property {typeof DATE_MONTHS[number]} month
 * @property {number} year
 * @property {number} hour
 * @property {number} minute
 * @property {number} second
 * @property {Date} date
 */

export class Conditional {
	/**
	 * @param {string|undefined} matchHeader
	 * @returns {Array<EtagItem>}
	 */
	static parseEtagList(matchHeader) {
		if(matchHeader === undefined) { return [] }

		return matchHeader.split(CONDITION_ETAG_SEPARATOR)
			.map(etag => etag.trim())
			.map(etag => {
				if(etag.startsWith(CONDITION_ETAG_WEAK_PREFIX)) {
					// weak
					return {
						weak: true,
						etag: etag.substring(CONDITION_ETAG_WEAK_PREFIX.length)
					}
				}

				// strong
				return {
					weak: false,
					etag
				}
			})
			.map(item => {
				if(item.etag === CONDITION_ETAG_ANY) {
					return {
						...item,
						any: true
					}
				}

				// validated quoted
				if(!isQuoted(item.etag)) { return undefined }
				const etag = stripQuotes(item.etag)
				if(!isValidEtag(etag)) { return undefined }
				if(etag === CONDITION_ETAG_ANY) { return undefined }

				return {
					weak: item.weak,
					any: false,
					etag
				}
			})
			.filter(item => item !== undefined)
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

		if(matchHeader.length != 29) { return undefined }

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
		const day = parseInt(matchHeader.substring(5, 7))
		const month = matchHeader.substring(8, 11)
		const year = parseInt(matchHeader.substring(12, 16))
		const hour = parseInt(matchHeader.substring(17, 19))
		const minute = parseInt(matchHeader.substring(20, 22))
		const second = parseInt(matchHeader.substring(23, 25))

		//
		if(!DATE_DAYS.includes(dayName)) { return undefined }
		if(!DATE_MONTHS.includes(month)) { return undefined }
		if(!Number.isInteger(day)) { return undefined }
		if(!Number.isInteger(year)) { return undefined }
		if(!Number.isInteger(hour)) { return undefined }
		if(!Number.isInteger(minute)) { return undefined }
		if(!Number.isInteger(second)) { return undefined }

		//
		if(day > 31 || day <= 0) { return undefined }
		if(year < 1900) { return undefined }
		if(hour > 24 || hour < 0) { return undefined }
		if(minute > 60 || minute < 0) { return undefined }
		if(second > 60 || second < 0) { return undefined }

		//
		return {
			dayName,
			day,
			month,
			year,
			hour,
			minute,
			second,
			date: new Date(Date.UTC(year, DATE_MONTHS.indexOf(month), day, hour, minute, second)),
			// temporal:
		}
	}
}

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

