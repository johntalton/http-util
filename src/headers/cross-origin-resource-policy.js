

/** @typedef {'same-site'|'same-origin'|'cross-origin'} CORPDirective */

export const CORP_DIRECTIVE_SAME_SITE = 'same-site'
export const CORP_DIRECTIVE_SAME_ORIGIN = 'same-origin'
export const CORP_DIRECTIVE_CROSS_ORIGIN = 'cross-origin'

export const CORP_KNOWN_DIRECTIVES = [
	CORP_DIRECTIVE_SAME_SITE,
	CORP_DIRECTIVE_SAME_ORIGIN,
	CORP_DIRECTIVE_CROSS_ORIGIN
]

export class CrossOriginResourcePolicy {
	/**
	 * @param {CORPDirective|undefined} directive
	 */
	static encode(directive) {
		if(directive === undefined) { return undefined }
		if(!CORP_KNOWN_DIRECTIVES.includes(directive)) { throw new TypeError('Invalid CORP Directive') }
		return directive
	}
}