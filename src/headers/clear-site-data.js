
/** @type {'*'} */
export const WILDCARD = '*'

export const CSD_DIRECTIVE_SEPARATOR = ','
export const CSD_QUOTE = '"'

export const CSD_DIRECTIVE_CACHE = 'cache'
export const CSD_DIRECTIVE_CLIENT_HINTS = 'clientHints'
export const CSD_DIRECTIVE_COOKIES = 'cookies'
export const CSD_DIRECTIVE_EXECUTION_CONTEXTS = 'executionContexts'
export const CSD_DIRECTIVE_PREFETCH_CACHE = 'prefetchCache'
export const CSD_DIRECTIVE_PRERENDER_CACHE = 'prerenderCache'
export const CSD_DIRECTIVE_STORAGE = 'storage'

/**
 * @typedef {Object} ClearOptions
 * @property {boolean} cache
 * @property {boolean} clientHints
 * @property {boolean} cookies
 * @property {boolean} executionContext
 * @property {boolean} prefetchCache
 * @property {boolean} prerenderCache
 * @property {boolean} storage
 */

export class SiteData {
	/**
	 * @param {Partial<ClearOptions>|true|'*'|undefined} directives
	 */
	static encode(directives) {
		if(directives === undefined) { return undefined }
		if(directives === true) { return WILDCARD }
		if(directives === WILDCARD) { return WILDCARD }

		const result = []
		if(directives.cache === true) { result.push(CSD_DIRECTIVE_CACHE) }
		if(directives.clientHints === true) { result.push(CSD_DIRECTIVE_CLIENT_HINTS) }
		if(directives.cookies === true) { result.push(CSD_DIRECTIVE_COOKIES) }
		if(directives.executionContext === true) { result.push(CSD_DIRECTIVE_EXECUTION_CONTEXTS) }
		if(directives.prefetchCache === true) { result.push(CSD_DIRECTIVE_PREFETCH_CACHE) }
		if(directives.prerenderCache === true) { result.push(CSD_DIRECTIVE_PRERENDER_CACHE) }
		if(directives.storage === true) { result.push(CSD_DIRECTIVE_STORAGE) }

		return result
			.map(item => `${CSD_QUOTE}${item}${CSD_QUOTE}`)
			.join(CSD_DIRECTIVE_SEPARATOR)
	}
}

// console.log(SiteData.encode())
// console.log(SiteData.encode({}))
// console.log(SiteData.encode(false))
// console.log(SiteData.encode('true'))
// console.log(SiteData.encode(true))
// console.log(SiteData.encode('*'))
// console.log(SiteData.encode({ storage: false }))
// console.log(SiteData.encode({ storage: true }))
// console.log(SiteData.encode({ storage: true, cookies: true }))