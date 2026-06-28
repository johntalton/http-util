import { COMMON_LIST_HEADER_JOINER_COMMA, COMMON_LIST_PARAMETER_JOINER_SEMICOLON, EMPTY, isNonEmptyArray } from '../defs.js'
import { KVP } from './util/kvp.js'
import { quoteValue } from './util/quote.js'

// https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.html

export const HTTP_HEADER_RATE_LIMIT = 'RateLimit'
export const HTTP_HEADER_RATE_LIMIT_POLICY = 'RateLimit-Policy'

/**
 * @typedef {Object} RateLimitInfo
 * @property {string} name
 * @property {number} remaining
 * @property {number} resetSeconds
 * @property {string|undefined} [partitionKey]
 */

/**
 * @typedef {Object} RateLimitPolicyInfo
 * @property {string} name
 * @property {number} quota
 * @property {number} size
 * @property {string} quotaUnits
 * @property {number} windowSeconds
 * @property {string|undefined} [partitionKey]
 */

export const LIMIT_PARAMETERS = {
	REMAINING_QUOTA: 'r',
	TIME_TILL_RESET_SECONDS: 't',
	PARTITION_KEY: 'pk'
}

export const POLICY_PARAMETER = {
	QUOTA: 'q',
	QUOTA_UNITS: 'qu',
	WINDOW_SECONDS: 'w',
	PARTITION_KEY: 'pk'
}

export const QUOTA_UNIT = {
	REQUEST: 'request',
	BYTES: 'content-bytes',
	CONCURRENT: 'concurrent-requests'
}

export class RateLimit {
	/**
	 * @param {RateLimitInfo} limitInfo
	 */
	static *#encode(limitInfo) {
		if(limitInfo === undefined) { return undefined }
		const { name, remaining, resetSeconds, partitionKey } = limitInfo

		if(name === undefined || remaining === undefined) { return undefined }

		yield quoteValue(name)
		yield KVP.encode(LIMIT_PARAMETERS.REMAINING_QUOTA, remaining)

		if(resetSeconds !== undefined && Number.isFinite(resetSeconds) && resetSeconds > 0) { yield KVP.encode(LIMIT_PARAMETERS.TIME_TILL_RESET_SECONDS, resetSeconds) }
		if(partitionKey !== undefined) { yield KVP.encode(LIMIT_PARAMETERS.PARTITION_KEY, partitionKey) }
	}

	/**
	 * @param {RateLimitInfo} limitInfo
	 */
	static encode(limitInfo) {
		const result = Array.from(RateLimit.#encode(limitInfo))
		if(result.length === 0) { return undefined }
		return result.join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
	}
}

export class RateLimitPolicy {
	/**
	 * @param {RateLimitPolicyInfo} policy
	 */
	static *#encode(policy) {
		const {
			name,
			quota,
			quotaUnits,
			windowSeconds,
			partitionKey
		} = policy

		yield quoteValue(name)
		yield KVP.encode(POLICY_PARAMETER.QUOTA, quota)

		if(quotaUnits !== undefined) { yield KVP.encode(POLICY_PARAMETER.QUOTA_UNITS, quotaUnits, true) }
		if(Number.isFinite(windowSeconds)) { yield KVP.encode(POLICY_PARAMETER.WINDOW_SECONDS, windowSeconds) }
		if(partitionKey !== undefined) { yield KVP.encode(POLICY_PARAMETER.PARTITION_KEY, partitionKey) }
	}


	/**
	 * @param {...RateLimitPolicyInfo} policies
	 */
	static encode(...policies) { // todo AsArray
		if(!isNonEmptyArray(policies)) { return undefined }

		const remainingPolicies = policies
			.filter(pol => {
				if(pol === undefined) { return false }
				if(pol.name === undefined) { return false }
				if(pol.name === EMPTY) { return false }
				if(!Number.isFinite(pol.quota)) { return false }

				return true
			})

		if(remainingPolicies.length === 0) { return undefined }

		return remainingPolicies
			.map(policy => {
				const result = Array.from(RateLimitPolicy.#encode(policy))
				return result.join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
			})
			.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
