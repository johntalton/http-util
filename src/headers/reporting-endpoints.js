import { COMMON_LIST_HEADER_JOINER_COMMA, normalizeToArray } from '../defs.js'
import { KVP } from './util/kvp.js'

/**
 * @typedef {Object} EndpointItem
 * @property {string} name
 * @property {URL|string} url
 */

export class ReportingEndpoints {
	/**
	 * @param {Array<EndpointItem>} endpoints
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
	 * @param {Array<EndpointItem>|EndpointItem|undefined} endpoints
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