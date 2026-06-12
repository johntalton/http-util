import { COMMON_LIST_HEADER_JOINER_COMMA, normalizeToArray } from "../defs.js"

/**
 * @typedef {Object} LinkItem
 * @property {URL|string} url
 * @property {string|undefined} [relation]
 * @property {Map<string, string>|undefined} [parameters]
 */

export class Link {
	/**
	 * @param {LinkItem} link
	 */
	static *#encode(link) {
		const encodedUri = (link.url instanceof URL) ? link.url : encodeURI(link.url)

		yield `<${encodedUri}>`
		if(link.relation !== undefined) { yield `rel="${link.relation}"` }
		if(link.parameters === undefined) { return }
		for(const [ key, value ] of link.parameters) {
			yield `${key}="${value}"`
		}
	}

	/**
	 * @param {Array<LinkItem>|LinkItem|undefined} links
	 * @param {boolean} [asArray = false]
	 */
	static encode(links, asArray = false) {
		const linkAry = normalizeToArray(links)
		if(linkAry === undefined) { return undefined }
		if(linkAry.length === 0) { return undefined }

		const ary = linkAry
			.map(link => [ ...Link.#encode(link) ].join('; '))

		return asArray ? ary : ary.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
