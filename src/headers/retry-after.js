import { InternetMessageFormatFixDate } from './util/imf-fixdate.js'

/** @import { IMFFixDateInput } from './util/imf-fixdate.js' */

/**
 * @typedef {number|Temporal.Duration|IMFFixDateInput} RetryAfterItem
 */

export const FEATURE_TEMPORAL = typeof Temporal !== 'undefined'

/**
 * @param {any} value
 * @returns {value is Temporal.Duration}
 */
export function isTemporalDuration(value) {
	if(!FEATURE_TEMPORAL) { return false }
	return value instanceof Temporal.Duration
}

export class RetryAfter {
	/**
	 * @param {RetryAfterItem|undefined} value
	 * @returns {string|undefined}
	 */
	static encode(value) {
		if(value === undefined) { return undefined }

		if(typeof value === 'number') {
			if(!Number.isFinite(value)) { return undefined }
			return `${Math.round(value)}`
		}

		if(isTemporalDuration(value)) {
			return value.total('seconds').toFixed(0)
		}

		return InternetMessageFormatFixDate.encode(value)
	}
}
