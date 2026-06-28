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
	 * @param {StrictTransportSecurityOptions} sts
	 */
	static *#encode(sts) {
		if(!Number.isFinite(sts.maxAge)) {
			throw new Error('invalid max-age')
		}

		const maxAge = sts.preload ? Math.max(STS_MIN_AGE_FOR_PRELOAD_SECS, sts.maxAge) : sts.maxAge
		yield KVP.encode(STS_MAX_AGE, maxAge)
		if(sts.includeSubDomains) { yield STS_INCLUDE_SUBDOMAIN }
		if(sts.preload) { yield STS_PRELOAD }
	}

	/**
	 * @param {StrictTransportSecurityOptions} sts
	 */
	static encode(sts) {
		if(sts === undefined) { return undefined }
		return [ ...StrictTransportSecurity.#encode(sts) ].join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
	}
}
