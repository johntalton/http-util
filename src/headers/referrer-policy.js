
/**
 * @typedef {
	'no-referrer' |
	'no-referrer-when-downgrade' |
	'origin' |
	'origin-when-cross-origin' |
	'same-origin' |
	'strict-origin' |
	'strict-origin-when-cross-origin' |
	'unsafe-url'
} ReferrerPolicyDirective */


export const REFERER_POLICY_DIRECTIVE_NO_REFERRER = 'no-referrer'
export const REFERER_POLICY_DIRECTIVE_NO_REFERRER_WHEN_DOWNGRADE = 'no-referrer-when-downgrade'
export const REFERER_POLICY_DIRECTIVE_ORIGIN = 'origin'
export const REFERER_POLICY_DIRECTIVE_ORIGIN_WHEN_CROSS_ORIGIN = 'origin-when-cross-origin'
export const REFERER_POLICY_DIRECTIVE_SAME_ORIGIN = 'same-origin'
export const REFERER_POLICY_DIRECTIVE_STRICT_ORIGIN = 'strict-origin'
export const REFERER_POLICY_DIRECTIVE_STRICT_ORIGIN_WHEN_CROSS_ORIGIN = 'strict-origin-when-cross-origin'
export const REFERER_POLICY_DIRECTIVE_UNSAFE_URL = 'unsafe-url'

export const REFERER_POLICY_KNOWN_DIRECTIVES = [
	REFERER_POLICY_DIRECTIVE_NO_REFERRER,
	REFERER_POLICY_DIRECTIVE_NO_REFERRER_WHEN_DOWNGRADE,
	REFERER_POLICY_DIRECTIVE_ORIGIN,
	REFERER_POLICY_DIRECTIVE_ORIGIN_WHEN_CROSS_ORIGIN,
	REFERER_POLICY_DIRECTIVE_SAME_ORIGIN,
	REFERER_POLICY_DIRECTIVE_STRICT_ORIGIN,
	REFERER_POLICY_DIRECTIVE_STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
	REFERER_POLICY_DIRECTIVE_UNSAFE_URL
]

export class ReferrerPolicy {

	/**
	 * @param {ReferrerPolicyDirective|undefined} directive
	 */
	static encode(directive) {
		if(directive === undefined) { return undefined }
		if(!REFERER_POLICY_KNOWN_DIRECTIVES.includes(directive)) { throw new TypeError('Invalid Referrer Policy Directive') }
		return directive
	}
}
