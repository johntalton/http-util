import { COMMON_LIST_HEADER_JOINER_COMMA, COMMON_LIST_PARAMETER_JOINER_SEMICOLON, normalizeToArray } from "../defs.js"

/** @typedef {
	'self' |
	'trusted-types-eval' |
	'unsafe-eval' |
	'wasm-unsafe-eval' |
	'unsafe-inline' |
	'unsafe-hashes' |
	'inline-speculation-rules' |
	'strict-dynamic' |
	'report-sample'
 } CSPSourceExpression */
/** @typedef {'none'} CSPNoneSource */
/** @typedef {'http:'|'https:'|'ws:'|'wss:'|'blob:'|'data:'} CSPSchemeSource */
/** @typedef {`nonce-${string}`} CSPNonceSource */
/** @typedef {`sha256-${string}`|`sha384-${string}`|`sha512-${string}`} CSPHashSource */
/** @typedef {string & { __brand: 'host' }} CSPHostSource */



/** @typedef {Extract<CSPSourceExpression, 'self'>| CSPSchemeSource | CSPHostSource} CSPFetchCommonSource */
/** @typedef {CSPSourceExpression | CSPHostSource | CSPSchemeSource | CSPNonceSource | CSPHashSource} CSPFetchAllSources */

/** @typedef {Extract<CSPSourceExpression, 'unsafe-hashes'|'unsafe-inline'|'report-sample'>} CSPFetchScriptAttr */
/** @typedef {Exclude<CSPSourceExpression, 'unsafe-hashes'>} CSPFetchScriptElem */



/**
 * @typedef {Object} CSPFetchDirective
 * @property {Array<CSPFetchAllSources> | CSPFetchAllSources | CSPNoneSource | undefined} [defaultSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [childSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [connectSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [fontSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [frameSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [imgSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [manifestSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [mediaSrc]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | CSPNoneSource | undefined} [objectSrc]
 * @property {Array<CSPFetchAllSources> | CSPFetchAllSources | CSPNoneSource | undefined} [scriptSrc]
 * @property {Array<CSPFetchScriptAttr> | CSPFetchScriptAttr | CSPNoneSource | undefined} [scriptSrcAttr]
 * @property {Array<CSPFetchScriptElem> | CSPFetchScriptElem | CSPNoneSource | undefined} [scriptSrcElem]
 * @property {} [styleSrc]
 * @property {} [styleSrcAttr]
 * @property {} [styleSrcElem]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | undefined} [workerSrc]
 */

/**
 * @typedef {Object} CSPDocumentDirective
 * @property {} [baseUri]
 * @property {} [sandbox]
 */

/**
 * @typedef {Object} CSPNavigationDirective
 * @property {} [frameAncestors]
 * @property {boolean} [upgradeInsecureRequests]
 */

/**
 * @typedef {CSPFetchDirective & CSPDocumentDirective & CSPNavigationDirective} CSPPolicy
 */

/*

report-to

FETCH
	//fenced-frame-src
	script-src-attr
	script-src-elem
	style-src-attr
	style-src-elem


OTHER
	require-trusted-types-for
	trusted-types
	upgrade-insecure-requests

NAVIGATION
	frame-ancestors 'none' | source-expression-list
	form-action 'none' | source-expression-list
*/

export const CSP_DIRECTIVE_FETCH_DEFAULT = 'default-src'
export const CSP_DIRECTIVE_FETCH_CHILD = 'child-src'
export const CSP_DIRECTIVE_FETCH_CONNECT = 'connect-src'
export const CSP_DIRECTIVE_FETCH_FONT = 'font-src'
export const CSP_DIRECTIVE_FETCH_FRAME = 'frame-src'
export const CSP_DIRECTIVE_FETCH_IMG = 'img-src'
export const CSP_DIRECTIVE_FETCH_MANIFEST = 'manifest-src'
export const CSP_DIRECTIVE_FETCH_MEDIA = 'media-src'
export const CSP_DIRECTIVE_FETCH_OBJECT = 'object-src'
export const CSP_DIRECTIVE_FETCH_WORKER = 'worker-src'
export const CSP_DIRECTIVE_FETCH_STYLE = 'style-src'
// export const CSP_DIRECTIVE_FETCH_STYLE_ATTR = 'style-src-attr'
// export const CSP_DIRECTIVE_FETCH_STYLE_ELEM = 'style-src-elem'
export const CSP_DIRECTIVE_FETCH_SCRIPT = 'script-src'
// export const CSP_DIRECTIVE_FETCH_SCRIPT_ATTR = 'script-src-attr'
// export const CSP_DIRECTIVE_FETCH_SCRIPT_ELEM = 'script-src-elem'

/**
 * @typedef {
	CSP_DIRECTIVE_FETCH_DEFAULT |
	CSP_DIRECTIVE_FETCH_CHILD |
	CSP_DIRECTIVE_FETCH_CONNECT |
	CSP_DIRECTIVE_FETCH_FONT |
	CSP_DIRECTIVE_FETCH_FRAME |
	CSP_DIRECTIVE_FETCH_IMG |
	CSP_DIRECTIVE_FETCH_MANIFEST |
	CSP_DIRECTIVE_FETCH_MEDIA |
	CSP_DIRECTIVE_FETCH_OBJECT |
	CSP_DIRECTIVE_FETCH_WORKER |
	CSP_DIRECTIVE_FETCH_STYLE |
	CSP_DIRECTIVE_FETCH_SCRIPT
} CSPDirective
*/

export const CSP_SOURCE_NONE = 'none'

export const CSP_SOURCE_EXPRESSION_SELF = 'self'
export const CSP_SOURCE_EXPRESSION_TRUSTED_TYPES_EVAL = 'trusted-types-eval'
export const CSP_SOURCE_EXPRESSION_UNSAFE_EVAL = 'unsafe-eval'
export const CSP_SOURCE_EXPRESSION_WASM_UNSAFE_EVAL = 'wasm-unsafe-eval'
export const CSP_SOURCE_EXPRESSION_UNSAFE_INLINE = 'unsafe-inline'
export const CSP_SOURCE_EXPRESSION_UNSAFE_HASHES = 'unsafe-hashes'
export const CSP_SOURCE_EXPRESSION_INLINE_SPECULATION_RULES = 'inline-speculation-rules'
export const CSP_SOURCE_EXPRESSION_STRICT_DYNAMIC = 'strict-dynamic'
export const CSP_SOURCE_EXPRESSION_REPORT_SAMPLE = 'report-sample'

export const KNOWN_CSP_SOURCE_EXPRESSIONS = [
	CSP_SOURCE_EXPRESSION_SELF,
	CSP_SOURCE_EXPRESSION_TRUSTED_TYPES_EVAL,
	CSP_SOURCE_EXPRESSION_UNSAFE_EVAL,
	CSP_SOURCE_EXPRESSION_WASM_UNSAFE_EVAL,
	CSP_SOURCE_EXPRESSION_UNSAFE_INLINE,
	CSP_SOURCE_EXPRESSION_UNSAFE_HASHES,
	CSP_SOURCE_EXPRESSION_INLINE_SPECULATION_RULES,
	CSP_SOURCE_EXPRESSION_STRICT_DYNAMIC,
	CSP_SOURCE_EXPRESSION_REPORT_SAMPLE
]

export const CSP_SCHEME_HTTP = 'http:'
export const CSP_SCHEME_HTTPS = 'https:'
export const CSP_SCHEME_WS = 'ws:'
export const CSP_SCHEME_WSS = 'wss:'
export const CSP_SCHEME_BLOB = 'blob:'
export const CSP_SCHEME_DATA = 'data:'

export const KNOWN_CSP_SCHEME_SOURCE = [
	CSP_SCHEME_HTTP,
	CSP_SCHEME_HTTPS,
	CSP_SCHEME_WS,
	CSP_SCHEME_WSS,
	CSP_SCHEME_BLOB,
	CSP_SCHEME_DATA
]

/**
 * @param {string|undefined} str
 * @returns {str is CSPHostSource}
 */
export function isCSPHost(str) {
	if(str === undefined) { return false }
	return true
}

/**
 * @param {string} value
 * @returns {`'${value}'`}
 */
export function singleQuoteValue(value) {
	return `'${value}'`
}

/**
 * @param {CSPFetchCommonSource|CSPFetchAllSources|CSPNoneSource} source
 */
export function processSource(source) {
	if(source === CSP_SOURCE_NONE) { return singleQuoteValue(source) }
	if(KNOWN_CSP_SCHEME_SOURCE.includes(source)) { return singleQuoteValue(source) }
	if(KNOWN_CSP_SOURCE_EXPRESSIONS.includes(source)) { return singleQuoteValue(source) }

	return source
}

/**
 * @param {CSPDirective} prefix
 * @param {Array<CSPFetchCommonSource|CSPFetchAllSources|CSPNoneSource>} list
 */
export function process(prefix, list) {
	return `${prefix} ${list.map(processSource).join(' ')}`
}

export class ContentSecurityPolicy {
	/**
	 * @param {string|undefined} host
	 * @returns {CSPHostSource}
	 */
	static Host(host) {
		if(!isCSPHost(host)) { throw new TypeError('not a valid CSP host') }
		return host
	}

	/**
	 * @param {CSPFetchDirective & CSPDocumentDirective & CSPNavigationDirective} policy
	 */
	static *#encode(policy) {
		if(policy.defaultSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_DEFAULT, normalizeToArray(policy.defaultSrc)) }

		if(policy.scriptSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_SCRIPT, normalizeToArray(policy.scriptSrc)) }
		// if(policy.workerSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_WORKER, normalizeToArray(policy.workerSrc)) }
		// if(policy.workerSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_WORKER, normalizeToArray(policy.workerSrc)) }

		if(policy.styleSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_STYLE, normalizeToArray(policy.styleSrc)) }
		// if(policy.workerSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_WORKER, normalizeToArray(policy.workerSrc)) }
		// if(policy.workerSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_WORKER, normalizeToArray(policy.workerSrc)) }

		if(policy.childSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_CHILD, normalizeToArray(policy.childSrc)) }
		if(policy.connectSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_CONNECT, normalizeToArray(policy.connectSrc)) }
		if(policy.fontSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_FONT, normalizeToArray(policy.fontSrc)) }
		if(policy.frameSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_FRAME, normalizeToArray(policy.frameSrc)) }
		if(policy.imgSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_IMG, normalizeToArray(policy.imgSrc)) }
		if(policy.manifestSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_MANIFEST, normalizeToArray(policy.manifestSrc)) }
		if(policy.mediaSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_MEDIA, normalizeToArray(policy.mediaSrc)) }
		if(policy.objectSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_OBJECT, normalizeToArray(policy.objectSrc)) }
		if(policy.workerSrc !== undefined) { yield process(CSP_DIRECTIVE_FETCH_WORKER, normalizeToArray(policy.workerSrc)) }

	}

	/**
	 * @param {Array<CSPPolicy>} policies
	 */
	static *#encodeList(policies) {
		for(const policy of policies) {
			const result = Array.from(ContentSecurityPolicy.#encode(policy))
			if(result.length === 0) { continue }
			yield result.join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
		}
	}

	/**
	 * @param {Array<CSPPolicy>|CSPPolicy|undefined} policies
	 * @param {boolean} [asArray = false]
	 * @returns {Array<string>|string|undefined}
	 */
	static encode(policies, asArray = false) {
		if(policies === undefined) { return undefined }

		const policiesList = normalizeToArray(policies)
		if(policiesList.length === 0) { return undefined }

		const result = Array.from(ContentSecurityPolicy.#encodeList(policiesList))
		if(result.length === 0) { return undefined }

		return asArray ? result : result.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
