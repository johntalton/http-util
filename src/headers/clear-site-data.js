import { COMMON_LIST_VALUE_JOINER_COMMA, COMMON_WILDCARD_ANY_ASTERISK } from '../defs.js'
import { quoteValue } from './util/quote.js'

/** @type {'*'} */
export const WILDCARD = COMMON_WILDCARD_ANY_ASTERISK

export const CSD_DIRECTIVE_SEPARATOR = ','

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
	 * @param {Partial<ClearOptions>} directives
	 */
	static *#encode(directives) {
		if(directives.cache === true) { yield quoteValue(CSD_DIRECTIVE_CACHE) }
		if(directives.clientHints === true) { yield quoteValue(CSD_DIRECTIVE_CLIENT_HINTS) }
		if(directives.cookies === true) { yield quoteValue(CSD_DIRECTIVE_COOKIES) }
		if(directives.executionContext === true) { yield quoteValue(CSD_DIRECTIVE_EXECUTION_CONTEXTS) }
		if(directives.prefetchCache === true) { yield quoteValue(CSD_DIRECTIVE_PREFETCH_CACHE) }
		if(directives.prerenderCache === true) { yield quoteValue(CSD_DIRECTIVE_PRERENDER_CACHE) }
		if(directives.storage === true) { yield quoteValue(CSD_DIRECTIVE_STORAGE) }
	}

	/**
	 * @param {Partial<ClearOptions>|true|'*'|undefined} directives
	 */
	static encode(directives) {
		if(directives === undefined) { return undefined }
		if(directives === true) { return WILDCARD }
		if(directives === WILDCARD) { return WILDCARD }

		const result = Array.from(SiteData.#encode(directives))
		if(result.length === 0) {return undefined }

		return result
			.join(COMMON_LIST_VALUE_JOINER_COMMA)
	}
}
