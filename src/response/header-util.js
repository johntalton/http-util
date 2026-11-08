import {
	COMMON_LIST_HEADER_JOINER_COMMA,
	COMMON_LIST_VALUE_JOINER_COMMA,
	CUSTOM_HEADER_PREFIX,
	EMPTY,
	normalizeToArray
} from '../defs.js'
import { SiteData } from '../headers/clear-site-data.js'
import { ClientHints } from '../headers/client-hints.js'
import { ContentSecurityPolicy } from '../headers/content-security-policy.js'
import { CrossOriginEmbedderPolicy } from '../headers/cross-origin-embedder-policy.js'
import { CrossOriginOpenerPolicy } from '../headers/cross-origin-opener-policy.js'
import { CrossOriginResourcePolicy } from '../headers/cross-origin-resource-policy.js'
import { Deprecation } from '../headers/deprecation.js'
import { UseAsDictionary } from '../headers/dictionary.js'
import { IntegrityPolicy } from '../headers/integrity-policy.js'
import { Link } from '../headers/link.js'
import { PermissionsPolicy } from '../headers/permissions-policy.js'
import { AppliedPreferences } from '../headers/preference.js'
import { RateLimit, RateLimitPolicy } from '../headers/rate-limit.js'
import { ReferrerPolicy } from '../headers/referrer-policy.js'
import { ReportingEndpoints } from '../headers/reporting-endpoints.js'
import { ServerTiming } from '../headers/server-timing.js'
import { StrictTransportSecurity } from '../headers/strict-transport-security.js'
import { Sunset } from '../headers/sunset.js'
import { ContentTypeOptions } from '../headers/x-content-type-options.js'
import { XSSProtection } from '../headers/x-xss-protection.js'
import {
	HTTP_HEADER_ACCEPT_CLIENT_HINTS,
	HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
	HTTP_HEADER_ACCESS_CONTROL_EXPOSE_HEADERS,
	HTTP_HEADER_CLEAR_SITE_DATE,
	HTTP_HEADER_CONTENT_SECURITY_POLICY,
	HTTP_HEADER_CONTENT_SECURITY_POLICY_REPORT_ONLY,
	HTTP_HEADER_CONTENT_TYPE,
	HTTP_HEADER_CONTENT_TYPE_OPTIONS,
	HTTP_HEADER_CROSS_ORIGIN_EMBEDDER_POLICY,
	HTTP_HEADER_CROSS_ORIGIN_EMBEDDER_POLICY_REPORT_ONLY,
	HTTP_HEADER_CROSS_ORIGIN_OPENER_POLICY,
	HTTP_HEADER_CROSS_ORIGIN_RESOURCE_POLICY,
	HTTP_HEADER_DEPRECATION,
	HTTP_HEADER_ETAG,
	HTTP_HEADER_INTEGRITY_POLICY,
	HTTP_HEADER_INTEGRITY_POLICY_REPORT_ONLY,
	HTTP_HEADER_LINK,
	HTTP_HEADER_PERMISSIONS_POLICY,
	HTTP_HEADER_PERMISSIONS_POLICY_REPORT_ONLY,
	HTTP_HEADER_PREFER,
	HTTP_HEADER_PREFERENCE_APPLIED,
	HTTP_HEADER_RATE_LIMIT,
	HTTP_HEADER_RATE_LIMIT_POLICY,
	HTTP_HEADER_REFERRER_POLICY,
	HTTP_HEADER_REPORTING_ENDPOINTS,
	HTTP_HEADER_SERVER,
	HTTP_HEADER_SERVER_TIMING,
	HTTP_HEADER_SERVICE_WORKER_ALLOWED,
	HTTP_HEADER_STATUS,
	HTTP_HEADER_STRICT_TRANSPORT_SECURITY,
	HTTP_HEADER_SUNSET,
	HTTP_HEADER_TIMING_ALLOW_ORIGIN,
	HTTP_HEADER_USE_AS_DICTIONARY,
	HTTP_HEADER_VARY,
	HTTP_HEADER_XSS_PROTECTION,
} from '../headers.js'
import {
	HTTP_METHOD_PATCH,
	HTTP_METHOD_POST,
	HTTP_METHOD_PUT,
} from '../methods.js'

/** @import { OutgoingHttpHeaders } from 'node:http2' */
/** @import { ClientPolicyMap, SendContext, Metadata, SendSupportedTypes, SendSupportedTypesNormalizedRecord } from '../defs.js' */

/**
 * @param {Record<string,Array<string>|string|number|undefined>} headers
 */
export function cleanHeaders(headers) {
	if(headers === undefined) { return {} }
	return Object.fromEntries(Object.entries(headers)
		.filter(([_, value]) => value !== undefined))
}

/**
 * @description Headers that disable older technologies or methodologies that are outdated
 * @param {boolean} includeHeaders
 * @returns {OutgoingHttpHeaders}
 */
export function legacyHeaders(includeHeaders) {
	if(includeHeaders !== true) { return {} }

	return {
		[HTTP_HEADER_CONTENT_TYPE_OPTIONS]: ContentTypeOptions.encode(true),
		[HTTP_HEADER_XSS_PROTECTION]: XSSProtection.encode(false)
	}
}

/**
 * @param {ClientPolicyMap|undefined} policy
 */
export function policyHeaders(policy) {
	if(policy === undefined) { return {} }

	const {
		CSP,
		COEP,
		COOP,
		CORP,
		permissions,
		referrer,
		integrity,
		reportingEndpoints
	} = policy

	const CSPList = normalizeToArray(CSP)
	const permissionsList = normalizeToArray(permissions)

	//
	const CSPGroup = Object.groupBy(CSPList ?? [], item => item.reportOnly === true ? 'reportOnly' : 'enforce')

	const COEPEnforce = COEP?.reportOnly === true ? undefined : COEP
	const COEPReportOnly = COEP?.reportOnly === true ? COEP : undefined

	const permissionsGroup = Object.groupBy(permissionsList ?? [], item => item.reportOnly === true ? 'reportOnly' : 'enforce' )

	const integrityEnforce = integrity?.reportOnly === true ? undefined : integrity
	const integrityReportOnly = integrity?.reportOnly === true ? integrity : undefined

	return cleanHeaders({
		[HTTP_HEADER_CONTENT_SECURITY_POLICY]: ContentSecurityPolicy.encode(CSPGroup.enforce),
		[HTTP_HEADER_CONTENT_SECURITY_POLICY_REPORT_ONLY]: ContentSecurityPolicy.encode(CSPGroup.reportOnly),
		[HTTP_HEADER_CROSS_ORIGIN_EMBEDDER_POLICY]: CrossOriginEmbedderPolicy.encode(COEPEnforce),
		[HTTP_HEADER_CROSS_ORIGIN_EMBEDDER_POLICY_REPORT_ONLY]: CrossOriginEmbedderPolicy.encode(COEPReportOnly),
		[HTTP_HEADER_CROSS_ORIGIN_OPENER_POLICY]: CrossOriginOpenerPolicy.encode(COOP),
		[HTTP_HEADER_CROSS_ORIGIN_RESOURCE_POLICY]: CrossOriginResourcePolicy.encode(CORP),
		[HTTP_HEADER_PERMISSIONS_POLICY]: PermissionsPolicy.encode(permissionsGroup.enforce),
		[HTTP_HEADER_PERMISSIONS_POLICY_REPORT_ONLY]: PermissionsPolicy.encode(permissionsGroup.reportOnly),
		[HTTP_HEADER_REFERRER_POLICY]: ReferrerPolicy.encode(referrer),
		[HTTP_HEADER_INTEGRITY_POLICY]: IntegrityPolicy.encode(integrityEnforce),
		[HTTP_HEADER_INTEGRITY_POLICY_REPORT_ONLY]: IntegrityPolicy.encode(integrityReportOnly),
		[HTTP_HEADER_REPORTING_ENDPOINTS]: ReportingEndpoints.encode(reportingEndpoints)
	})
}

/**
 * @param {SendContext} context
 * @returns {{ vary?: Array<string>|undefined, headers?: OutgoingHttpHeaders }}
 */
export function contextHeaders(context) {
	if(context === undefined) { return {} }

	const vary = []

	const appliedPreferences = AppliedPreferences.encode(context.appliedPreferences)
	if(appliedPreferences !== undefined) { vary.push(HTTP_HEADER_PREFER) }

	return {
		vary: vary.length === 0 ? undefined : vary,
		headers: cleanHeaders({
			[HTTP_HEADER_CLEAR_SITE_DATE]: SiteData.encode(context.clearSiteData),
			[HTTP_HEADER_ACCEPT_CLIENT_HINTS]: ClientHints.encode(context.acceptClientHints),
			[HTTP_HEADER_LINK]: Link.encode(context.links),
			[HTTP_HEADER_PREFERENCE_APPLIED]: appliedPreferences,
			[HTTP_HEADER_SUNSET]: Sunset.encode(context.sunset),
			[HTTP_HEADER_DEPRECATION]: Deprecation.encode(context.deprecation),

			[HTTP_HEADER_RATE_LIMIT]: RateLimit.encode(context.rateLimitInfo),
			[HTTP_HEADER_RATE_LIMIT_POLICY]: RateLimitPolicy.encode(context.rateLimitPolicies),

			[HTTP_HEADER_SERVICE_WORKER_ALLOWED]: context.serviceWorkerAllowed,

			[HTTP_HEADER_USE_AS_DICTIONARY]: UseAsDictionary.encode(context.useAsDictionary),

			...policyHeaders(context.policy)
		})
	}
}

/**
 * @param {...Array<string>|undefined} headers
 */
export function varyHeaders(...headers) {
	const result = headers.reduce((acc, header) => {
		if(header === undefined) { return acc }
		return acc.union(new Set(header.filter(key => key !== undefined && key !== EMPTY)))
	}, new Set())

	const vary = result.keys().toArray()
	if(vary.length === 0) { return {} }

	return {
		[HTTP_HEADER_VARY]: vary.join(COMMON_LIST_VALUE_JOINER_COMMA)
	}
}

/**
 * @param {number} status
 * @param {string|undefined} contentType
 * @param {Array<string>} exposedHeaders
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function coreHeaders(status, contentType, exposedHeaders, meta) {
	// todo Assert.isArray or undefined exposedHeaders
	const exposed = [ HTTP_HEADER_ETAG, HTTP_HEADER_SERVER, ...exposedHeaders ] // todo include lastModified

	// todo Assert.isString(contentType) if not undefined
	// todo Assert.isString(meta.servername) if not undefined
	// todo Assert.isString(meta.origin) if not undefined

	const hsts = StrictTransportSecurity.encode(meta.HSTS)
	const hstsHeaders = hsts === undefined ? {} : { [HTTP_HEADER_STRICT_TRANSPORT_SECURITY]: hsts }

	return ({
		[HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_ACCESS_CONTROL_EXPOSE_HEADERS]: exposed.join(COMMON_LIST_VALUE_JOINER_COMMA),
		// Access-Control-Allow-Credentials // for non-preflight
		[HTTP_HEADER_STATUS]: status,
		[HTTP_HEADER_CONTENT_TYPE]: contentType,
		[HTTP_HEADER_SERVER]: meta.servername,
		...hstsHeaders
	})
}

/**
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function performanceHeaders(meta) {
	return {
		[HTTP_HEADER_TIMING_ALLOW_ORIGIN]: meta.origin,
		[HTTP_HEADER_SERVER_TIMING]: ServerTiming.encode(meta.performance)
	}
}

/**
 * @param {Metadata} meta
 * @returns {OutgoingHttpHeaders}
 */
export function customHeaders(meta) {
	const m = new Map(meta.customHeaders?.filter(h => h[0].startsWith(CUSTOM_HEADER_PREFIX)))
	return Object.fromEntries(m)
}

/**
 * @param {Array<string>|string|undefined} methods
 * @param {Array<string>|undefined} supportedTypesArray
 * @returns {SendSupportedTypesNormalizedRecord}
 */
export function coerceSupportedTypes_FromArray(methods, supportedTypesArray) {
	// Assert.isString(methods) if not array or undefined
	const methodsList = normalizeToArray(methods)

	const put = (methodsList?.includes(HTTP_METHOD_PUT)) ? supportedTypesArray : undefined
	const post = (methodsList?.includes(HTTP_METHOD_POST)) ? supportedTypesArray : undefined
	const patch = (methodsList?.includes(HTTP_METHOD_PATCH)) ? supportedTypesArray : undefined

	return { put, post, patch }
}

/**
 * @param {Array<string>|string|undefined} methods
 * @param {SendSupportedTypes|undefined} supportedTypes
 * @returns {SendSupportedTypesNormalizedRecord}
 */
export function coerceSupportedTypes(methods, supportedTypes) {
	if(supportedTypes === undefined) {
		return {
			put: undefined,
			post: undefined,
			patch: undefined
		}
	}

	if(Array.isArray(supportedTypes)) {
		if(supportedTypes.length === 0) {
			return {
				put: undefined,
				post: undefined,
				patch: undefined
			}
		}

		return coerceSupportedTypes_FromArray(methods, supportedTypes)
	}

	if(typeof supportedTypes === 'string') {
		return coerceSupportedTypes_FromArray(methods, [ supportedTypes ])
	}

	// todo should this list be filtered by method or allowed to override
	// const methodsList = normalizeToArray(methods)
	return {
		put: normalizeToArray(supportedTypes.put),
		post: normalizeToArray(supportedTypes.post),
		patch: normalizeToArray(supportedTypes.patch)
	}
}

/**
 * @param {Array<OutgoingHttpHeaders>} headersSet
 */
export function mergeHeaders(headersSet) {
	if(headersSet === undefined) { return {} }
	const result = new Map()

	for(const headers of headersSet) {
		for(const [ header, value ] of Object.entries(headers)) {
			if(value === undefined) {
				if(result.has(header)) { continue }
				result.set(header, [])
			}
			else if(result.has(header)) {
				const current = result.get(header)
				result.set(header, [ ...current, value ])
			}
			else {
				result.set(header, Array.isArray(value) ? value : [ value ])
			}
		}
	}

	return Object.fromEntries(result.entries()
		.map(([ key, value ]) => {
			if(value.length === 0) { return [ key, undefined ] }
			if(value.length === 1) { return [ key, value[0] ] }
			return [ key, value?.join(COMMON_LIST_HEADER_JOINER_COMMA) ]
		}))
}