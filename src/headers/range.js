import { EMPTY, RANGE_UNITS_BYTES } from '../defs.js'
import { Assert } from './util/assert.js'

/** @import { AcceptRangeUnits } from '../defs.js' */

export const RANGE_EQUAL = '='
export const RANGE_SEPARATOR = '-'
export const RANGE_LIST_SEPARATOR = ','

/**
 * @typedef {Object} RangeValueFixed
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} RangeValueOpenEnded
 * @property {number} start
 * @property {EMPTY} end
 */

/**
 * @typedef {Object} RangeValueFromEnd
 * @property {EMPTY} start
 * @property {number} end
 */

/** @typedef {RangeValueFixed | RangeValueOpenEnded | RangeValueFromEnd} RangeValue */

/** @typedef {RangeValueFixed} NormalizedRangeValue */

/**
 * @template RV
 * @typedef {Object} RangeDirective
 * @property {AcceptRangeUnits|undefined} units
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
		Assert.isString(rangeHeader)

		if(!rangeHeader.startsWith(RANGE_UNITS_BYTES)) { return undefined }
		if(!(rangeHeader.slice(RANGE_UNITS_BYTES.length, RANGE_UNITS_BYTES.length + 1) === RANGE_EQUAL)) { return undefined }
		const rangeStr = rangeHeader.slice(RANGE_UNITS_BYTES.length + RANGE_EQUAL.length).trim()
		if(rangeStr === EMPTY) { return undefined }

		const ranges = rangeStr.split(RANGE_LIST_SEPARATOR)
			.map(range => range.trim())
			.map(range => {
				const [ startStr, endStr ] = range.split(RANGE_SEPARATOR)
				/* c8 ignore next */
				if(startStr === undefined) { return undefined } // impossible as split always returns string
				if(endStr === undefined) { return undefined }
				if(startStr === EMPTY && endStr === EMPTY) { return undefined }

				const start = Number.parseInt(startStr, 10)
				const end = Number.parseInt(endStr, 10)

				if(startStr === EMPTY) {
					if(!Number.isInteger(end)) { return undefined }
					if(end === 0) { return undefined }
					return { start: EMPTY, end }
				}

				if(endStr === EMPTY) {
					if(!Number.isInteger(start)) { return undefined }
					return { start, end: EMPTY }
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
		if(!Number.isInteger(contentLength)) { return undefined }
		if(contentLength <= 0) { return undefined }

		/** @type {Array<NormalizedRangeValue>} */
		const normalizedRanges = directive.ranges.map(({ start, end }) => {
			if(end === EMPTY) { return { start, end: contentLength - 1 } }
			if(start === EMPTY) { return { start: contentLength - end, end: contentLength - 1 } }
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
