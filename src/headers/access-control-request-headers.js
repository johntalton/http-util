import { EMPTY } from "../defs.js"
import { Assert } from "./util/assert.js"


export const ACCESS_CONTROL_REQUEST_HEADER_SEPARATOR = ','

export class AccessControlRequestHeaders {
	/**
	 * @param {string|undefined} header
	 * @returns {Array<string>|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		Assert.isString(header)

		const result = header
			.split(ACCESS_CONTROL_REQUEST_HEADER_SEPARATOR)
			.map(item => item.trim())
			.filter(item => item !== EMPTY)

		if(result.length === 0) { return undefined }

		return result
	}
}