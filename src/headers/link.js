/**
 * @typedef {Object} LinkItem
 * @property {string} url
 * @property {string|undefined} [relation]
 * @property {Map<string, string>|undefined} [parameters]
 */

export class Link {
	/**
	 * @param {LinkItem} link
	 */
	static  *#encode(link) {
		const encodedUri = encodeURI(link.url)

		yield `<${encodedUri}>`
		if(link.relation !== undefined) { yield `rel="${link.relation}"` }
		if(link.parameters === undefined) { return }
		for(const [ key, value ] of link.parameters) {
			yield `${key}="${value}"`
		}
	}


	/**
	 * @param {LinkItem} link
	 */
	static encode(link) {
		return [ ...Link.#encode(link) ].join('; ')
	}
}

// console.log(Link.encode({ url: '/index.html', parameters: new Map([ [ 'as', 'style' ], [ 'fetchpriority', 'high' ] ]) }))
//  console.log(Link.encode({ url: '/index.html', relation: 'next', parameters: new Map([  [ 'fetchpriority', 'high' ] ]) }))
//  console.log(Link.encode({ url: '/index.html', relation: 'next' }))
// console.log(Link.encode({ url: 'https://example.com/苗条', relation: 'preconnect' }))
