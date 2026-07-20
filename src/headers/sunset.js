import { InternetMessageFormatFixDate } from './util/imf-fixdate.js'

/** @import { IMFFixDateInput } from './util/imf-fixdate.js' */

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8594}
 */
export class Sunset {
	/**
	 * @param {IMFFixDateInput} when
	 * @returns {string|undefined}
	 */
	static encode(when) {
		return InternetMessageFormatFixDate.encode(when)
	}
}
