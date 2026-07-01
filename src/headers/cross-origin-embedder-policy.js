import { COMMON_LIST_PARAMETER_JOINER_SEMICOLON } from '../defs.js'
import { KVP } from './util/kvp.js'

/** @typedef {'unsafe-none'|'require-corp'|'credentialless'} COEPDirective */
/**
 * @typedef {Object} COEPItem
 * @property {COEPDirective} directive
 * @property {string|undefined} [reportTo]
 */

export const COEP_REPORT_TO = 'report-to'

export const COEP_DIRECTIVE_UNSAFE_NONE = 'unsafe-none'
export const COEP_DIRECTIVE_REQUIRE_CORP = 'require-corp'
export const COEP_DIRECTIVE_CREDENTIALLESS = 'credentialless'

export const COEP_KNOWN_DIRECTIVES = [
	COEP_DIRECTIVE_UNSAFE_NONE,
	COEP_DIRECTIVE_REQUIRE_CORP,
	COEP_DIRECTIVE_CREDENTIALLESS
]

export class CrossOriginEmbedderPolicy {
	/**
	 * @param {COEPItem} item
	 */
	static *#encode(item) {
		const { directive, reportTo } = item
		if(!COEP_KNOWN_DIRECTIVES.includes(directive)) { throw new TypeError('Invalid COEP Directive') }

		yield directive

		if(reportTo !== undefined) {
			yield KVP.encode(COEP_REPORT_TO, reportTo, true)
		}
	}

	/**
	 * @param {COEPItem|undefined} item
	 */
	static encode(item) {
		if(item === undefined) { return undefined }
		if(item.directive === undefined) { return undefined }

		const result = Array.from(CrossOriginEmbedderPolicy.#encode(item))
		/* c8 ignore next */
		if(result.length === 0) { return undefined } // always yields one item (directive)

		return result.join(COMMON_LIST_PARAMETER_JOINER_SEMICOLON)
	}

}