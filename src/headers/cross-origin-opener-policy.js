
/** @typedef {'unsafe-none'|'same-origin'|'same-origin-allow-popups'|'noopener-allow-popups'} COOPDirective */

export const COOP_DIRECTIVE_UNSAFE_NONE = 'unsafe-none'
export const COOP_DIRECTIVE_SAME_ORIGIN = 'same-origin'
export const COOP_DIRECTIVE_SAME_ORIGIN_ALLOW_POPUPS = 'same-origin-allow-popups'
export const COOP_DIRECTIVE_NO_OPENER_ALLOW_POPUPS = 'noopener-allow-popups'

export const COOP_KNOWN_DIRECTIVES = [
	COOP_DIRECTIVE_UNSAFE_NONE,
	COOP_DIRECTIVE_SAME_ORIGIN,
	COOP_DIRECTIVE_SAME_ORIGIN_ALLOW_POPUPS,
	COOP_DIRECTIVE_NO_OPENER_ALLOW_POPUPS
]

export class CrossOriginOpenerPolicy {
	/**
	 * @param {COOPDirective|undefined} directive
	 */
	static encode(directive) {
		if(directive === undefined) { return undefined }
		if(!COOP_KNOWN_DIRECTIVES.includes(directive)) { throw new TypeError('Invalid COOP Directive') }
		return directive
	}
}
