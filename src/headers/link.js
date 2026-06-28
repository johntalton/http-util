import { COMMON_LIST_HEADER_JOINER_COMMA, COMMON_LIST_PARAMETER_JOINER_SEMICOLON, normalizeToArray } from '../defs.js'
import { KVP } from './util/kvp.js'

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
		if(link.relation !== undefined) { yield KVP.encode('rel', link.relation, true) }
		if(link.parameters === undefined) { return }
		for(const [ key, value ] of link.parameters) {
			yield KVP.encode(key, value, true)
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
			.map(link => [ ...Link.#encode(link) ].join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON))

		return asArray ? ary : ary.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
