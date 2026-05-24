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
	static  *#encode(link) {
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
	 */
	static encode(links) {
		if(links === undefined) { return undefined }
		const linkAry = Array.isArray(links) ? links : [ links ]
		if(linkAry.length === 0) { return undefined }
		return linkAry
			.map(link => [ ...Link.#encode(link) ].join('; '))
			.join(', ')
	}
}
