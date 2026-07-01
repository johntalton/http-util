
import { COMMON_LIST_HEADER_JOINER_COMMA, COMMON_LIST_VALUE_JOINER_COMMA, normalizeToArray } from '../defs.js'
import { KVP } from './util/kvp.js'

/** @import { ReportingEndpointName } from './reporting-endpoints.js' */

export const INTEGRITY_POLICY_LIST_JOINER_SPACE = ' '

export const INTEGRITY_POLICY_DIRECTIVE_BLOCKED_DESTINATION = 'blocked-destinations'
export const INTEGRITY_POLICY_DIRECTIVE_SOURCE = 'sources'
export const INTEGRITY_POLICY_DIRECTIVE_ENDPOINTS = 'endpoints'


export const INTEGRITY_POLICY_BLOCKED_DESTINATION_SCRIPT = 'script'
export const INTEGRITY_POLICY_BLOCKED_DESTINATION_STYLE = 'style'

/** @typedef {INTEGRITY_POLICY_BLOCKED_DESTINATION_SCRIPT|INTEGRITY_POLICY_BLOCKED_DESTINATION_STYLE} ResourceDestination */

export const INTEGRITY_POLICY_SOURCE_INLINE = 'inline'

/** @typedef {INTEGRITY_POLICY_SOURCE_INLINE} IntegritySource */

/**
 * @typedef {Object} IntegrityPolicyItem
 * @property {Array<ResourceDestination>|ResourceDestination} [blockedDestinations]
 * @property {Array<IntegritySource>|IntegritySource} [sources]
 * @property {Array<ReportingEndpointName>|ReportingEndpointName} [endpoints]
 */

export class IntegrityPolicy {
	/**
	 * @param {IntegrityPolicyItem} policy
	 */
	static *#encodePolicy(policy) {
		if(policy.blockedDestinations !== undefined) {
			const blockDestList = normalizeToArray(policy.blockedDestinations)
			if(blockDestList.length > 0) {
				//
				const result = `(${blockDestList.join(INTEGRITY_POLICY_LIST_JOINER_SPACE)})`
				yield KVP.encode(INTEGRITY_POLICY_DIRECTIVE_BLOCKED_DESTINATION, result)
			}
		}

		if(policy.sources !== undefined) {
			const sourcesList = normalizeToArray(policy.sources)
			if(sourcesList.length > 0) {
				//
				const result = `(${sourcesList.join(INTEGRITY_POLICY_LIST_JOINER_SPACE)})`
				yield KVP.encode(INTEGRITY_POLICY_DIRECTIVE_SOURCE, result)
			}
		}

		if(policy.endpoints !== undefined) {
			const endpointsList = normalizeToArray(policy.endpoints)
			if(endpointsList.length > 0) {
				// todo valid reporting endpoint name
				// const valid = endpointsList.every(isReportingEndpointName)

				const result = `(${endpointsList.join(INTEGRITY_POLICY_LIST_JOINER_SPACE)})`
				yield KVP.encode(INTEGRITY_POLICY_DIRECTIVE_ENDPOINTS, result)
			}
		}

	}

	/**
	 * @param {Array<IntegrityPolicyItem>} policies
	 */
	static *#encodeList(policies) {
		for(const policy of policies) {
			const result = Array.from(IntegrityPolicy.#encodePolicy(policy))
			if(result.length === 0) { continue }
			yield result.join(COMMON_LIST_VALUE_JOINER_COMMA)
		}
	}

	/**
	 * @param {Array<IntegrityPolicyItem>|IntegrityPolicyItem|undefined} policies
	 * @param {boolean} [asArray=false]
	 */
	static encode(policies, asArray = false) {
		if(policies === undefined) { return undefined }

		const policyList = normalizeToArray(policies)
		const result = Array.from(IntegrityPolicy.#encodeList(policyList))
		if(result.length === 0) { return undefined }

		return asArray ? result : result.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}