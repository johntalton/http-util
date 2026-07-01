import { COMMON_LIST_HEADER_JOINER_COMMA, COMMON_LIST_PARAMETER_JOINER_SEMICOLON, normalizeToArray } from "../defs.js"
import { KVP } from "./util/kvp.js"
import { quoteValue } from "./util/quote.js"

/** @typedef {
	'accelerometer' |
	'ambient-light-sensor' |
	'aria-notify' |
	'autoplay' |
	'bluetooth' |
	'camera' |
	'captured-surface-control' |
	'ch-ua-high-entropy-values' |
	'compute-pressure' |
	'cross-origin-isolated' |
	'deferred-fetch' |
	'deferred-fetch-minimal' |
	'display-capture' |
	'encrypted-media' |
	'fullscreen' |
	'gamepad' |
	'geolocation' |
	'gyroscope' |
	'hid' |
	'identity-credentials-get' |
	'idle-detection' |
	'language-detector' |
	'local-fonts' |
	'local-network' |
	'local-network-access' |
	'loopback-network' |
	'magnetometer' |
	'microphone' |
	'midi' |
	'on-device-speech-recognition' |
	'otp-credentials' |
	'payment' |
	'picture-in-picture' |
	'private-state-token-issuance' |
	'private-state-token-redemption' |
	'publickey-credentials-create' |
	'publickey-credentials-get' |
	'screen-wake-lock' |
	'serial' |
	'speaker-selection' |
	'storage-access' |
	'translator' |
	'summarizer' |
	'usb' |
	'web-share' |
	'window-management' |
	'xr-spatial-tracking'
 } PermissionPolicyDirective */
/** @typedef {string} PermissionPolicyOrigin */

/** @typedef {'*'|'()'|Array<'self'|'src'|PermissionPolicyOrigin>} PermissionsPolicyAllowList */

/**
 * @typedef {Object} PermissionsPolicyItem
 * @property {PermissionPolicyDirective} directive
 * @property {PermissionsPolicyAllowList} allowList
 * @property {string|undefined} [reportTo]
 */

export const PERMISSION_POLICY_ALLOW_LIST_ANY = '*'
export const PERMISSION_POLICY_ALLOW_DISABLE = '()'

export const PERMISSION_POLICY_ALLOW_SELF = 'self'

export const PERMISSION_POLICY_ALLOW_SRC = 'src'

export const PERMISSION_POLICY_DIRECTIVE_REPORT_TO = 'report-to'

export const PERMISSION_POLICY_ALLOW_LIST_JOINER_SPACE = ' '

export class PermissionsPolicy {
	/**
	 * @param {PermissionsPolicyAllowList} allowList
	 */
	static #encodeAllowList(allowList) {
		if(allowList === PERMISSION_POLICY_ALLOW_LIST_ANY) { return allowList }
		if(allowList === PERMISSION_POLICY_ALLOW_DISABLE) { return allowList }
		// if(allowList === PERMISSION_POLICY_ALLOW_SELF) { return allowList }

		if(!Array.isArray(allowList)) { throw new TypeError('Invalid Allow List Value') }

		const result = allowList
			.map(item => {
				if(item === PERMISSION_POLICY_ALLOW_SELF) { return item }
				if(item === PERMISSION_POLICY_ALLOW_SRC) { return item }
				if(item === PERMISSION_POLICY_ALLOW_LIST_ANY) { throw new TypeError('Allow List can not contain Any') }
				return quoteValue(item)
			})
			.join(PERMISSION_POLICY_ALLOW_LIST_JOINER_SPACE)

		return `(${result})`
	}

	/**
	 * @param {PermissionsPolicyItem} policy
	 */
	static #encodePolicy(policy) {
		const { directive, allowList, reportTo } = policy
		if(directive === undefined) { return undefined }
		if(allowList === undefined) { return undefined }

		const allowListString = PermissionsPolicy.#encodeAllowList(allowList)

		if(reportTo === undefined) {
			return KVP.encode(directive, allowListString)
		}

		return [
			KVP.encode(directive, allowListString),
			KVP.encode(PERMISSION_POLICY_DIRECTIVE_REPORT_TO, reportTo) ]
			.join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
	}

	/**
	 * @param {Array<PermissionsPolicyItem>} policies
	 */
	static *#encodeList(policies) {
		for(const policy of policies) {
			const result = PermissionsPolicy.#encodePolicy(policy)
			if(result === undefined) { continue }
			yield result
		}
	}

	/**
	 * @param {Array<PermissionsPolicyItem>|PermissionsPolicyItem|undefined} policies
	 * @param {boolean} [asArray=false]
	 */
	static encode(policies, asArray = false) {
		if(policies === undefined) { return undefined }

		const policyList = normalizeToArray(policies)
		const result = Array.from(PermissionsPolicy.#encodeList(policyList))
		if(result.length === 0) { return undefined }

		return asArray ? result : result.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}
