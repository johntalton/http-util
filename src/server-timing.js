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
	 * @param {Array<TimingsInfo>} timings
	 */
	static encode(timings) {
		if(timings === undefined) { return undefined }
		if(timings.length <= 0) { return undefined }

		return timings
			.map(({ name, duration, description }) => [
					`${name}`,
					description !== undefined ? `${SERVER_TIMING_KEY_DESCRIPTION}${SERVER_TIMING_SEPARATOR.KVP}"${description}"` : undefined,
					duration !== undefined ? `${SERVER_TIMING_KEY_DURATION}${SERVER_TIMING_SEPARATOR.KVP}${Math.trunc(duration * 10) / 10}` : undefined
				]
				.filter(item => item !== undefined)
				.join(SERVER_TIMING_SEPARATOR.PARAMETER))
			.join(SERVER_TIMING_SEPARATOR.METRIC)
	}
}


// console.log(ServerTiming.encode([{ name: 'missedCache' }]))
// console.log(ServerTiming.encode([{ name: 'cpu', duration: 2.4 }]))

// // cache;desc="Cache Read";dur=23.2
// console.log(ServerTiming.encode([{ name: 'cache', duration: 23.2, description: "Cache Read" }]))

// // db;dur=53, app;dur=47.2
// console.log(ServerTiming.encode([
// 	{ name: 'db', duration: 54 },
// 	{ name: 'app', duration: 47.2 }
// ]))