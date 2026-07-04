import { COMMON_LIST_PARAMETER_JOINER_SEMICOLON } from '../defs.js'
import { KVP } from './util/kvp.js'

export const STS_MAX_AGE = 'max-age'
export const STS_INCLUDE_SUBDOMAIN = 'includeSubDomains'
export const STS_PRELOAD = 'preload'

export const STS_MIN_AGE_FOR_PRELOAD_SECS = 60 * 60 * 24 * 365 // 31536000

/**
 * @typedef {Object} StrictTransportSecurityOptions
 * @property {number} maxAge
 * @property {boolean|undefined} [includeSubDomains]
 * @property {boolean|undefined} [preload]
 */

export class StrictTransportSecurity {
	/**
	 * @param {StrictTransportSecurityOptions} hsts
	 */
	static *#encode(hsts) {
		if(!Number.isFinite(hsts.maxAge)) {
			throw new TypeError('invalid max-age')
		}

		const maxAge = hsts.preload ? Math.max(STS_MIN_AGE_FOR_PRELOAD_SECS, hsts.maxAge) : hsts.maxAge
		yield KVP.encode(STS_MAX_AGE, maxAge)
		if(hsts.includeSubDomains) { yield STS_INCLUDE_SUBDOMAIN }
		if(hsts.preload) { yield STS_PRELOAD }
	}

	/**
	 * @param {StrictTransportSecurityOptions|undefined} hsts
	 */
	static encode(hsts) {
		if(hsts === undefined) { return undefined }
		return [ ...StrictTransportSecurity.#encode(hsts) ].join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
	}
}
