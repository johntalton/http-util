import { RANGE_UNITS_BYTES } from "./response/defs.js"

export const RANGE_EQUAL = '='
export const RANGE_SEPARATOR = '-'
export const RANGE_LIST_SEPARATOR = ','

/** @type {''} */
export const RANGE_EMPTY = ''

/**
 * @typedef {Object} RangeValueFixed
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} RangeValueOpenEnded
 * @property {number} start
 * @property {''} end
 */

/**
 * @typedef {Object} RangeValueFromEnd
 * @property {''} start
 * @property {number} end
 */

/** @typedef {RangeValueFixed | RangeValueOpenEnded | RangeValueFromEnd} RangeValue */

/** @typedef {RangeValueFixed} NormalizedRangeValue */

/**
 * @template RV
 * @typedef {Object} RangeDirective
 * @property {'bytes'|'none'|undefined} units
 * @property {Array<RV>} ranges
 */

/**
 * @typedef {Object} RangeDirectiveInfo
 * @property {boolean} exceeds
 * @property {boolean} overlap
 */


export class Range {
	/**
	 * @param {string|undefined} rangeHeader
	 * @returns {RangeDirective<RangeValue>|undefined}
	 */
	static parse(rangeHeader) {
		if(rangeHeader === undefined) { return undefined }
		if(!rangeHeader.startsWith(RANGE_UNITS_BYTES)) { return undefined }
		if(!(rangeHeader.substring(RANGE_UNITS_BYTES.length, RANGE_UNITS_BYTES.length + 1) === RANGE_EQUAL)) { return undefined }
		const rangeStr = rangeHeader.substring(RANGE_UNITS_BYTES.length + RANGE_EQUAL.length).trim()
		if(rangeStr === '') { return undefined }

		const ranges = rangeStr.split(RANGE_LIST_SEPARATOR)
			.map(range => range.trim())
			.map(range => {
				const [ startStr, endStr ] = range.split(RANGE_SEPARATOR)
				if(startStr === undefined) { return undefined }
				if(endStr === undefined) { return undefined }
				if(startStr === RANGE_EMPTY && endStr === RANGE_EMPTY) { return undefined }

				const start = Number.parseInt(startStr, 10)
				const end = Number.parseInt(endStr, 10)

				if(startStr === RANGE_EMPTY) {
					if(!Number.isInteger(end)) { return undefined }
					if(end === 0) { return undefined }
					return { start: RANGE_EMPTY, end }
				}

				if(endStr === RANGE_EMPTY) {
					if(!Number.isInteger(start)) { return undefined }
					return { start, end: RANGE_EMPTY }
				}

				if(!(Number.isInteger(start) && Number.isInteger(end))) { return undefined }
				return { start, end }
			})
			.filter(range => range !== undefined)

		if(ranges.length === 0) { return undefined }

		return {
			units: RANGE_UNITS_BYTES,
			ranges
		}
	}

	/**
	 * @param {RangeDirective<RangeValue>|undefined} directive
	 * @param {number} contentLength
	 * @returns {RangeDirectiveInfo & RangeDirective<NormalizedRangeValue>|undefined}
	 */
	static normalize(directive, contentLength) {
		if(directive === undefined) { return undefined }

		/** @type {Array<NormalizedRangeValue>} */
		const normalizedRanges = directive.ranges.map(({ start, end }) => {
			if(end === RANGE_EMPTY) { return { start, end: contentLength - 1 } }
			if(start === RANGE_EMPTY) { return { start: contentLength - end, end: contentLength - 1 } }
			return { start, end }
		})

		const exceeds = normalizedRanges.reduce((acc, value) => (acc || (value.start >= contentLength) || (value.end >= contentLength)), false)

		const { overlap } = normalizedRanges
			.toSorted((a, b) => a.start - b.start)
			.reduce((acc, item) => ({
					overlap: acc.overlap || acc.end > item.start,
					end: item.end
				}), { overlap: false, end: 0 })

		return {
			units: directive.units,
			overlap,
			exceeds,
			ranges: normalizedRanges
		}
	}
}

// console.log(Range.parse(''))
// console.log(Range.parse('='))
// console.log(Range.parse('foo'))
// console.log(Range.parse('bytes'))
// console.log(Range.parse('bytes='))
// console.log(Range.parse('bytes=-'))
// console.log(Range.parse('bytes=foo'))
// console.log(Range.parse('bytes=0-foo'))
// console.log(Range.parse('bytes=0-0xff'))
// console.log()
// console.log(Range.parse('bytes=1024-'))
// console.log(Range.parse('bytes=-1024'))
// console.log(Range.parse('bytes=0-1024'))
// console.log()
// console.log(Range.parse('bytes=0-0,-1'))
// console.log(Range.parse('bytes=0-1024, -1024'))
// console.log(Range.parse('bytes= 0-999, 4500-5499, -1000'))
// console.log(Range.parse('bytes=500-600,601-999'))

// console.log('------')
// console.log(Range.normalize(Range.parse('bytes=1024-'), 5000))
// console.log(Range.normalize(Range.parse('bytes=-1024'), 5000))
// console.log(Range.normalize(Range.parse('bytes=0-1024'), 5000))
// console.log(Range.normalize(Range.parse('bytes=0-0,-1'), 10000)) // 0 and 9999
// console.log(Range.normalize(Range.parse('bytes=0-1024, -1024'), 5000))
// console.log(Range.normalize(Range.parse('bytes= 0-999, 4500-5499, -1000'), 5000))
// console.log(Range.normalize(Range.parse('bytes=500-600,601-999'), 5000))

// console.log(Range.normalize(Range.parse('bytes=-500'), 10000)) // 9500-9999
