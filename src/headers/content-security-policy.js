/** biome-ignore-all lint/style/noExcessiveLinesPerFile: type complexity abound */

import {
	COMMON_LIST_HEADER_JOINER_COMMA,
	COMMON_LIST_PARAMETER_JOINER_SEMICOLON,
	EMPTY,
	normalizeToArray
} from '../defs.js'

/** @typedef {
	'self' |
	'trusted-types-eval' |
	'unsafe-eval' |
	'wasm-unsafe-eval' |
	'unsafe-inline' |
	'unsafe-hashes' |
	'strict-dynamic' |
	'report-sample' |

	'inline-speculation-rules' |

	'unsafe-allow-redirects' |
	'report-sha256' |
	'report-sha384' |
	'report-sha512' |
	'unsafe-webtransport-hashes'
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
/** @typedef {Extract<CSPSourceExpression, 'self'|'unsafe-eval'|'unsafe-inline'|'unsafe-hashes'|'report-sample'> | CSPNonceSource | CSPHashSource} CSPFetchStyleSource */
/** @typedef {Extract<CSPSourceExpression, 'unsafe-hashes'|'unsafe-inline'|'report-sample'>} CSPFetchStyleSourceAttr */
/** @typedef {Extract<CSPSourceExpression, 'self'|'unsafe-eval'|'unsafe-inline'|'report-sample'> | CSPNonceSource | CSPHashSource} CSPFetchStyleSourceElem */

/**
 * @typedef {Object} CSPFetchPolicy
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
 * @property {Array<CSPFetchStyleSource> | CSPFetchStyleSource | CSPNoneSource | undefined} [styleSrc]
 * @property {Array<CSPFetchStyleSourceAttr> | CSPFetchStyleSourceAttr | CSPNoneSource | undefined} [styleSrcAttr]
 * @property {Array<CSPFetchStyleSourceElem> | CSPFetchStyleSourceElem| CSPNonceSource} [styleSrcElem]
 * @property {Array<CSPFetchCommonSource> | CSPFetchCommonSource | undefined} [workerSrc]
 */




/** @typedef {Extract<CSPSourceExpression, 'self'>| CSPSchemeSource | CSPHostSource} CSPDocumentBaseURI */

/** @typedef {
	'allow-downloads' |
	'allow-forms' |
	'allow-modals' |
	'allow-orientation-lock' |
	'allow-pointer-lock' |
	'allow-popups' |
	'allow-popups-to-escape-sandbox' |
	'allow-presentation' |
	'allow-same-origin' |
	'allow-scripts' |
	'allow-storage-access-by-user-activation' |
	'allow-top-navigation' |
	'allow-top-navigation-by-user-activation' |
	'allow-top-navigation-to-custom-protocols'
} CSPSandbox */

/**
 * @typedef {Object} CSPDocumentPolicy
 * @property {Array<CSPDocumentBaseURI> | CSPDocumentBaseURI | CSPNoneSource | undefined} [baseUri]
 * @property {Array<CSPSandbox> | CSPSandbox | boolean | undefined} [sandbox]
 */




/** @typedef {Extract<CSPSourceExpression, 'self'>| CSPSchemeSource | CSPHostSource} CSPNavigationCommon */

/**
 * @typedef {Object} CSPNavigationPolicy
 * @property {Array<CSPNavigationCommon> | CSPNavigationCommon | CSPNoneSource | undefined} [frameAncestors]
 * @property {Array<CSPNavigationCommon> | CSPNavigationCommon | CSPNoneSource | undefined} [formAction]
 */




/** @typedef {string & { readonly __brand: unique symbol }} CSPOtherPolicyName */
/** @typedef {'script'} CSPOtherRequiredTrustedTypesForValues */

/**
 * @typedef {Object} CSPOtherTrustedTypesObject
 * @property {Array<CSPOtherPolicyName> | CSPOtherPolicyName } policyNames
 * @property {boolean} [allowDuplicates]
 */

/**
 * @typedef {Object} CSPOtherPolicy
 * @property {CSPOtherRequiredTrustedTypesForValues | undefined} [requireTrustedTypesFor]
 * @property {CSPOtherTrustedTypesObject | Array<CSPOtherPolicyName> | CSPOtherPolicyName | CSPNoneSource | boolean | undefined} [trustedTypes]
 * @property {boolean | undefined} [upgradeInsecureRequests]
 */



/**
 * @typedef {Object} CSPReportingPolicy
 * @property {string|undefined} [reportTo]
 */


/**
 * @typedef {CSPFetchPolicy & CSPDocumentPolicy & CSPNavigationPolicy & CSPOtherPolicy & CSPReportingPolicy} CSPPolicy
 */


//
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
export const CSP_DIRECTIVE_FETCH_STYLE_ATTR = 'style-src-attr'
export const CSP_DIRECTIVE_FETCH_STYLE_ELEM = 'style-src-elem'
export const CSP_DIRECTIVE_FETCH_SCRIPT = 'script-src'
export const CSP_DIRECTIVE_FETCH_SCRIPT_ATTR = 'script-src-attr'
export const CSP_DIRECTIVE_FETCH_SCRIPT_ELEM = 'script-src-elem'

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
	CSP_DIRECTIVE_FETCH_STYLE_ATTR |
	CSP_DIRECTIVE_FETCH_STYLE_ELEM |
	CSP_DIRECTIVE_FETCH_SCRIPT |
	CSP_DIRECTIVE_FETCH_SCRIPT_ATTR |
	CSP_DIRECTIVE_FETCH_SCRIPT_ELEM
} CSPFetchDirective
*/

export const CSP_DIRECTIVE_DOCUMENT_BASE_URI = 'base-uri'
export const CSP_DIRECTIVE_DOCUMENT_SANDBOX = 'sandbox'

/** @typedef {
	CSP_DIRECTIVE_DOCUMENT_BASE_URI |
	CSP_DIRECTIVE_DOCUMENT_SANDBOX
} CSPDocumentDirective
*/

export const CSP_DIRECTIVE_NAVIGATION_FRAME_ANCESTORS = 'frame-ancestors'
export const CSP_DIRECTIVE_NAVIGATION_FORM_ACTION = 'form-action'

/** @typedef {
	CSP_DIRECTIVE_NAVIGATION_FRAME_ANCESTORS |
	CSP_DIRECTIVE_NAVIGATION_FORM_ACTION
} CSPNavigationDirective
*/

export const CSP_DIRECTIVE_OTHER_REQUIRED_TRUSTED_TYPES_FOR = 'require-trusted-types-for'
export const CSP_DIRECTIVE_OTHER_TRUSTED_TYPES = 'trusted-types'
export const CSP_DIRECTIVE_OTHER_UPGRADE_INSECURE_REQUESTS = 'upgrade-insecure-requests'

/** @typedef {
	CSP_DIRECTIVE_OTHER_REQUIRED_TRUSTED_TYPES_FOR |
	CSP_DIRECTIVE_OTHER_TRUSTED_TYPES |
	CSP_DIRECTIVE_OTHER_UPGRADE_INSECURE_REQUESTS
} CSPOtherDirective
 */


export const CSP_DIRECTIVE_REPORTING_REPORT_TO = 'report-to'

/** @typedef {CSP_DIRECTIVE_REPORTING_REPORT_TO} CSPReportingDirective */


//
export const CSP_SOURCE_NONE = 'none'

//
export const CSP_SOURCE_HASH_SHA256_PREFIX = 'sha256-'
export const CSP_SOURCE_HASH_SHA384_PREFIX = 'sha384-'
export const CSP_SOURCE_HASH_SHA512_PREFIX = 'sha512-'

//
export const CSP_SOURCE_NONCE_PREFIX = 'nonce-'

//
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

//
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

export const CSP_OTHER_SANDBOX_VALUE_ALLOW_DOWNLOADS = 'allow-downloads'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_FORMS = 'allow-forms'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_MODALS = 'allow-modals'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_ORIENTATION_LOCK = 'allow-orientation-lock'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_POINTER_LOC = 'allow-pointer-lock'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_POPUPS = 'allow-popups'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_POPUPS_TO_ESCAPE_SANDBOX = 'allow-popups-to-escape-sandbox'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_PRESENTATION = 'allow-presentation'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_SAME_ORIGIN = 'allow-same-origin'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_SCRIPTS = 'allow-scripts'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_STORAGE_ACCESS_BY_USER_ACTIVATION = 'allow-storage-access-by-user-activation'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_TOP_NAVIGATION = 'allow-top-navigation'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION = 'allow-top-navigation-by-user-activation'
export const CSP_OTHER_SANDBOX_VALUE_ALLOW_TOP_NAVIGATION_TO_CUSTOM_PROTOCOLS = 'allow-top-navigation-to-custom-protocols'

export const KNOWN_CSP_SANDBOX_VALUE = [
	CSP_OTHER_SANDBOX_VALUE_ALLOW_DOWNLOADS,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_FORMS,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_MODALS,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_ORIENTATION_LOCK,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_POINTER_LOC,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_POPUPS,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_POPUPS_TO_ESCAPE_SANDBOX,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_PRESENTATION,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_SAME_ORIGIN,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_SCRIPTS,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_STORAGE_ACCESS_BY_USER_ACTIVATION,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_TOP_NAVIGATION,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION,
	CSP_OTHER_SANDBOX_VALUE_ALLOW_TOP_NAVIGATION_TO_CUSTOM_PROTOCOLS
]

/** @type {'allow-duplicates'} */
export const CSP_OTHER_TRUSTED_TYPES_ALLOW_DUPLICATES = 'allow-duplicates'

/** @type  {'script'} */
export const CSP_OTHER_REQUIRED_TRUSTED_TYPES_FOR_SCRIPT = 'script'

export const POLICY_PARAM_JOINER_SPACE = ' '

/**
 * @param {string|undefined} str
 * @returns {str is CSPHostSource}
 */
export function isCSPHost(str) {
	if(str === undefined) { return false }
	if(str === EMPTY) { return false }

	// todo this should be URL-like string

	return true
}

export const CSP_OTHER_TRUSTED_TYPES_POLICY_NAME_REGEX = /^[a-zA-Z0-9\-#=_\/@.%]+$/v
export const CSP_OTHER_TRUSTED_TYPES_POLICY_NAME_ANY = '*'

/**
 * @param {string|undefined} name
 * @returns {name is CSPOtherPolicyName}
 */
export function isPolicyName(name) {
	if(name === undefined) { return false }

	if(name === CSP_OTHER_TRUSTED_TYPES_POLICY_NAME_ANY) { return true }

	// alphanumeric and -#=_/@.%
	return CSP_OTHER_TRUSTED_TYPES_POLICY_NAME_REGEX.test(name)
}

/**
 * @param {string|undefined} input
 * @returns {input is CSPHashSource}
 */
export function isHash(input) {
	if(input === undefined) { return false }
	if(input.startsWith(CSP_SOURCE_HASH_SHA256_PREFIX)) { return true }
	if(input.startsWith(CSP_SOURCE_HASH_SHA384_PREFIX)) { return true }
	if(input.startsWith(CSP_SOURCE_HASH_SHA512_PREFIX)) { return true }

	return false
}

/**
 * @param {string|undefined} input
 * @returns {input is CSPNonceSource}
 */
export function isNonce(input) {
	if(input === undefined) { return false }
	return input.startsWith(CSP_SOURCE_NONCE_PREFIX)
}

/**
 * @param {string} value
 * @returns {`'${value}'`}
 */
export function singleQuoteValue(value) {
	return `'${value}'`
}

/**
 * @param {CSPSourceExpression|CSPNoneSource|CSPSchemeSource|CSPNonceSource|CSPHashSource|CSPHostSource} source
 */
export function processFetchSource(source) {
	if(source === CSP_SOURCE_NONE) { return singleQuoteValue(source) }
	if(KNOWN_CSP_SCHEME_SOURCE.includes(source)) { return singleQuoteValue(source) }
	if(KNOWN_CSP_SOURCE_EXPRESSIONS.includes(source)) { return singleQuoteValue(source) }

	if(isHash(source)) { return singleQuoteValue(source) }
	if(isNonce(source)) { return singleQuoteValue(source) }

	return source
}

/**
 * @param {CSPFetchDirective} prefix
 * @param {Array<CSPSourceExpression|CSPNoneSource|CSPSchemeSource|CSPNonceSource|CSPHashSource|CSPHostSource>} list
 */
export function processFetch(prefix, list) {
	if(list.length === 0) { return prefix }
	return `${prefix} ${list.map(processFetchSource).join(POLICY_PARAM_JOINER_SPACE)}`
}

/**
 * @param {CSPDocumentBaseURI | CSPSandbox | CSPNoneSource} value
 */
export function processDocumentValue(value) {
	if(value === CSP_SOURCE_NONE) { return singleQuoteValue(value) }
	if(KNOWN_CSP_SCHEME_SOURCE.includes(value)) { return singleQuoteValue(value) }
	if(KNOWN_CSP_SOURCE_EXPRESSIONS.includes(value)) { return singleQuoteValue(value) }

	return value
}

/**
 * @param {CSPDocumentDirective} prefix
 * @param {Array<CSPDocumentBaseURI | CSPSandbox|CSPNoneSource>} list
 */
export function processDocument(prefix, list) {
	if(list.length === 0) { return prefix }
	return `${prefix} ${list.map(processDocumentValue).join(POLICY_PARAM_JOINER_SPACE)}`
}

/**
 * @param {CSPNavigationCommon|CSPNoneSource} value
 */
export function processNavigationValue(value) {
	if(value === CSP_SOURCE_NONE) { return singleQuoteValue(value) }
	if(KNOWN_CSP_SCHEME_SOURCE.includes(value)) { return singleQuoteValue(value) }
	if(KNOWN_CSP_SOURCE_EXPRESSIONS.includes(value)) { return singleQuoteValue(value) }

	return value
}

/**
 * @param {CSPNavigationDirective} prefix
 * @param {Array<CSPNavigationCommon|CSPNoneSource>} list
 */
export function processNavigation(prefix, list) {
	if(list.length === 0) { return prefix }
	return `${prefix} ${list.map(processNavigationValue).join(POLICY_PARAM_JOINER_SPACE)}`
}

/**
 * @param {CSPOtherRequiredTrustedTypesForValues|CSPOtherPolicyName|CSPNoneSource|CSP_OTHER_TRUSTED_TYPES_ALLOW_DUPLICATES} value
 */
export function processOtherValue(value) {
	if(value === CSP_SOURCE_NONE) { return singleQuoteValue(value) }
	if(value === CSP_OTHER_TRUSTED_TYPES_ALLOW_DUPLICATES) { return singleQuoteValue(value) }
	if(value === CSP_OTHER_REQUIRED_TRUSTED_TYPES_FOR_SCRIPT) { return singleQuoteValue(value) }

	return value
}

/**
 * @param {CSPOtherDirective} prefix
 * @param {Array<CSPOtherRequiredTrustedTypesForValues|CSPOtherPolicyName|CSPNoneSource|CSP_OTHER_TRUSTED_TYPES_ALLOW_DUPLICATES>} list
 */
export function processOther(prefix, list) {
	if(list.length === 0) { return prefix }
	return `${prefix} ${list.map(processOtherValue).join(POLICY_PARAM_JOINER_SPACE)}`
}

/**
 * @param {CSPReportingDirective} prefix
 * @param {string} item
 */
export function processReporting(prefix, item) {
	return `${prefix} ${item}`
}


export class ContentSecurityPolicy {
	/**
	 * @param {string|undefined} host
	 * @returns {CSPHostSource}
	 */
	static host(host) {
		if(!isCSPHost(host)) { throw new TypeError('Not a valid CSP host') }
		return host
	}

	/**
	 * @param {string|undefined} name
	 * @returns {CSPOtherPolicyName}
	 */
	static policyName(name) {
		if(!isPolicyName(name)) { throw new TypeError('Not a valid CSP Policy Name')}
		return name
	}

	/**
	 * @param {CSPFetchPolicy} policy
	 */
	static *#encodeFetch(policy) {
		// Fetch Directives
		if(policy.defaultSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_DEFAULT, normalizeToArray(policy.defaultSrc)) }
		//
		if(policy.scriptSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_SCRIPT, normalizeToArray(policy.scriptSrc)) }
		if(policy.scriptSrcAttr !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_SCRIPT_ATTR, normalizeToArray(policy.scriptSrcAttr)) }
		if(policy.scriptSrcElem !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_SCRIPT_ELEM, normalizeToArray(policy.scriptSrcElem)) }
		//
		if(policy.styleSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_STYLE, normalizeToArray(policy.styleSrc)) }
		if(policy.styleSrcAttr !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_STYLE_ATTR, normalizeToArray(policy.styleSrcAttr)) }
		if(policy.styleSrcElem !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_STYLE_ELEM, normalizeToArray(policy.styleSrcElem)) }
		//
		if(policy.childSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_CHILD, normalizeToArray(policy.childSrc)) }
		if(policy.connectSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_CONNECT, normalizeToArray(policy.connectSrc)) }
		if(policy.fontSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_FONT, normalizeToArray(policy.fontSrc)) }
		if(policy.frameSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_FRAME, normalizeToArray(policy.frameSrc)) }
		if(policy.imgSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_IMG, normalizeToArray(policy.imgSrc)) }
		if(policy.manifestSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_MANIFEST, normalizeToArray(policy.manifestSrc)) }
		if(policy.mediaSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_MEDIA, normalizeToArray(policy.mediaSrc)) }
		if(policy.objectSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_OBJECT, normalizeToArray(policy.objectSrc)) }
		if(policy.workerSrc !== undefined) { yield processFetch(CSP_DIRECTIVE_FETCH_WORKER, normalizeToArray(policy.workerSrc)) }
	}

	/**
	 * @param {CSPDocumentPolicy} policy
	 */
	static *#encodeDocument(policy) {
		// Document Directives
		if(policy.baseUri !== undefined) { yield processDocument(CSP_DIRECTIVE_DOCUMENT_BASE_URI, normalizeToArray(policy.baseUri)) }

		if(policy.sandbox !== undefined) {
			if(policy.sandbox === true) { yield CSP_DIRECTIVE_DOCUMENT_SANDBOX }
			else if(policy.sandbox !== false) {
				yield processDocument(CSP_DIRECTIVE_DOCUMENT_SANDBOX, normalizeToArray(policy.sandbox))
			}
		}
	}


	/**
	 * @param {CSPNavigationPolicy} policy
	 */
	static *#encodeNavigation(policy) {
		// Navigation Directives
		if(policy.frameAncestors !== undefined) { yield processNavigation(CSP_DIRECTIVE_NAVIGATION_FRAME_ANCESTORS, normalizeToArray(policy.frameAncestors)) }

		if(policy.formAction !== undefined) { yield processNavigation(CSP_DIRECTIVE_NAVIGATION_FORM_ACTION, normalizeToArray(policy.formAction)) }
	}

	/**
	 * @param {CSPOtherPolicy} policy
	 */
	static *#encodeOther(policy) {
		// Other Directives
		if(policy.requireTrustedTypesFor !== undefined) {
			yield processOther(CSP_DIRECTIVE_OTHER_REQUIRED_TRUSTED_TYPES_FOR, normalizeToArray(policy.requireTrustedTypesFor))
		}

		if(policy.trustedTypes !== undefined) {
			if(policy.trustedTypes === true) { yield CSP_DIRECTIVE_OTHER_TRUSTED_TYPES }
			else if(typeof policy.trustedTypes === 'string' || Array.isArray(policy.trustedTypes)) {
				yield processOther(CSP_DIRECTIVE_OTHER_TRUSTED_TYPES, normalizeToArray(policy.trustedTypes))
			}
			else if(policy.trustedTypes !== false){
				if(policy.trustedTypes.policyNames === undefined) {
					yield CSP_DIRECTIVE_OTHER_TRUSTED_TYPES
				}
				else if(policy.trustedTypes.allowDuplicates === true){
					//
					const list = [ ...normalizeToArray(policy.trustedTypes.policyNames),  CSP_OTHER_TRUSTED_TYPES_ALLOW_DUPLICATES ]
					yield processOther(CSP_DIRECTIVE_OTHER_TRUSTED_TYPES, list)
				}
				else{
					yield processOther(CSP_DIRECTIVE_OTHER_TRUSTED_TYPES, normalizeToArray(policy.trustedTypes.policyNames))
				}
			}
		}

		if(policy.upgradeInsecureRequests === true) { yield CSP_DIRECTIVE_OTHER_UPGRADE_INSECURE_REQUESTS }
	}

	/**
	 * @param {CSPReportingPolicy} policy
	 */
	static *#encodeReporting(policy) {
		if(policy.reportTo !== undefined && policy.reportTo !== EMPTY) { yield processReporting(CSP_DIRECTIVE_REPORTING_REPORT_TO, policy.reportTo) }
	}

	/**
	 * @param {CSPPolicy} policy
	 */
	static *#encodePolicy(policy) {
		yield* ContentSecurityPolicy.#encodeFetch(policy)
		yield* ContentSecurityPolicy.#encodeDocument(policy)
		yield* ContentSecurityPolicy.#encodeNavigation(policy)
		yield* ContentSecurityPolicy.#encodeOther(policy)
		yield* ContentSecurityPolicy.#encodeReporting(policy)
	}

	/**
	 * @param {Array<CSPPolicy>} policies
	 */
	static *#encodePolicyList(policies) {
		for(const policy of policies) {
			const result = Array.from(ContentSecurityPolicy.#encodePolicy(policy))
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

		const result = Array.from(ContentSecurityPolicy.#encodePolicyList(policiesList))
		if(result.length === 0) { return undefined }

		return asArray ? result : result.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
