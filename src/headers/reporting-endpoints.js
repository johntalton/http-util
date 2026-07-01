import { COMMON_LIST_HEADER_JOINER_COMMA, EMPTY, normalizeToArray } from '../defs.js'
import { KVP } from './util/kvp.js'

/** @typedef {string & { readonly __brand: unique symbol }} ReportingEndpointName */

/**
 * @typedef {Object} ReportingEndpointsItem
 * @property {ReportingEndpointName} name
 * @property {URL|string} url
 */


/**
 * @param {string|undefined} name
 * @returns {name is ReportingEndpointName}
 */
export function isReportingEndpointName(name) {
	if(name === undefined) { return false }
	if(name === EMPTY) { return false }

	return true
}

export class ReportingEndpoints {
	/**
	 * @param {string|undefined} name
	 * @returns {ReportingEndpointName}
	 */
	static name(name) {
		if(!isReportingEndpointName(name)) { throw new TypeError('Invalid Reporting Endpoint Name') }
		return name
	}

	/**
	 * @param {Array<ReportingEndpointsItem>} endpoints
	 */
	static *#encode(endpoints) {
		for(const endpoint of endpoints) {
			if(endpoint.name === undefined) { continue }
			if(endpoint.url === undefined) { continue }
			const url = endpoint.url instanceof URL ? endpoint.url : new URL(endpoint.url)
			// todo assert url.scheme is secure
			yield KVP.encode(endpoint.name, url.href, true)
		}
	}

	/**
	 * @param {Array<ReportingEndpointsItem>|ReportingEndpointsItem|undefined} endpoints
	 */
	static encode(endpoints) {
		if(endpoints === undefined) { return undefined }

		const endpointList = normalizeToArray(endpoints)
		if(endpointList.length === 0) { return undefined }

		const result = Array.from(ReportingEndpoints.#encode(endpointList))
		if(result.length === 0) { return undefined }

		return result
			.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}