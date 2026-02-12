import { RANGE_UNITS_BYTES } from "./response/defs.js"

export const CONTENT_RANGE_UNKNOWN = '*'
export const CONTENT_RANGE_SEPARATOR = '-'
export const CONTENT_RANGE_SIZE_SEPARATOR = '/'

export const DEFAULT_CONTENT_RANGE_DIRECTIVE = {
	units: RANGE_UNITS_BYTES,
	range: CONTENT_RANGE_UNKNOWN,
	size: CONTENT_RANGE_UNKNOWN
}
/**
 * @typedef {Object} ContentRangeDirective
 * @property {RANGE_UNITS_BYTES|undefined} [units]
 * @property {{ start: number, end: number }|CONTENT_RANGE_UNKNOWN|undefined} [range]
 * @property {number|CONTENT_RANGE_UNKNOWN|undefined} [size]
 */

export class ContentRange {
	/**
	 * @param {ContentRangeDirective|undefined} rangeDirective
	 * @returns {string|undefined}
	 */
	static encode(rangeDirective) {
		if(rangeDirective === undefined) { return undefined }

		const units = rangeDirective.units ?? DEFAULT_CONTENT_RANGE_DIRECTIVE.units
		const size = rangeDirective.size ?? DEFAULT_CONTENT_RANGE_DIRECTIVE.size
		const range = rangeDirective.range ?? DEFAULT_CONTENT_RANGE_DIRECTIVE.range

		if(units !== RANGE_UNITS_BYTES) { return undefined }
		if(size !== CONTENT_RANGE_UNKNOWN && !Number.isInteger(size)) { return undefined }

		if((typeof range === 'string')) {
			if(range !== CONTENT_RANGE_UNKNOWN) { return undefined }
			return `${units} ${CONTENT_RANGE_UNKNOWN}${CONTENT_RANGE_SIZE_SEPARATOR}${size}`
		}

		const rangeStr = `${range.start}${CONTENT_RANGE_SEPARATOR}${range.end}`
		return `${units} ${rangeStr}${CONTENT_RANGE_SIZE_SEPARATOR}${size}`
	}
}

// console.log(ContentRange.encode({}))
// console.log(ContentRange.encode({ size: '*' }))
// console.log(ContentRange.encode({ units: 'bytes' }))
// console.log(ContentRange.encode({ range: '*' }))
// console.log(ContentRange.encode({ range: '*', size: '*' }))

// console.log()
// console.log(ContentRange.encode({ range: { start: 0, end: 1024 } }))
// console.log(ContentRange.encode({ range: { start: 0, end: 1024 }, size: 1024  }))
// console.log(ContentRange.encode({ range: '*', size: 1024 }))
// console.log(ContentRange.encode({ size: 1024 }))

// console.log()
// console.log(ContentRange.encode({ units: 'bob' }))
// console.log(ContentRange.encode({ range: 'bob' }))
// console.log(ContentRange.encode({ size: 'bob' }))
