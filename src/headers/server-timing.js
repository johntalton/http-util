export const SERVER_TIMING_KEY_DURATION = 'dur' // common in milliseconds
export const SERVER_TIMING_KEY_DESCRIPTION = 'desc'

export const HTTP_HEADER_SERVER_TIMING = 'Server-Timing'
export const HTTP_HEADER_TIMING_ALLOW_ORIGIN = 'Timing-Allow-Origin'

export const SERVER_TIMING_SEPARATOR = {
	METRIC: ',',
	PARAMETER: ';',
	KVP: '='
}

/**
 * @typedef {Object} TimingsInfo
 * @property {string} name
 * @property {number|undefined} duration
 * @property {string|undefined} [description]
 */

export class ServerTiming {
	/**
	 * @param {Array<TimingsInfo>|undefined} timings
	 */
	static encode(timings) {
		if(timings === undefined) { return undefined }
		if(timings.length <= 0) { return undefined }

		return timings
			.map(({ name, duration, description }) => [
					`${name}`,
					description === undefined ? undefined : `${SERVER_TIMING_KEY_DESCRIPTION}${SERVER_TIMING_SEPARATOR.KVP}"${description}"`,
					duration === undefined ? undefined : `${SERVER_TIMING_KEY_DURATION}${SERVER_TIMING_SEPARATOR.KVP}${Math.trunc(duration * 10) / 10}`
				]
				.filter(item => item !== undefined)
				.join(SERVER_TIMING_SEPARATOR.PARAMETER))
			.join(SERVER_TIMING_SEPARATOR.METRIC) // todo COMMON_LIST_HEADER_JOINER_COMMA
	}
}
