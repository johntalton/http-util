import { isNonEmptyArray } from '../defs.js'
import { parseAcceptStyleHeader } from './util/accept-util.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */

export const LANGUAGE_ANY = '*'

export const WELL_KNOWN_LANGUAGES = new Map([
	[ 'en-US,en;q=0.5', [ { name: 'en-US', quality: 1 }, { name: 'en', quality: 0.5 } ] ],
	[ 'en-US,en;q=0.9', [ { name: 'en-US', quality: 1 }, { name: 'en', quality: 0.9 } ] ],
	// [ '*', [ { name: '*', quality: 1 } ]]
])

export class AcceptLanguage {
	/**
	 * @param {string|undefined} acceptLanguageHeader
	 */
	static parse(acceptLanguageHeader) {
		return parseAcceptStyleHeader(acceptLanguageHeader, WELL_KNOWN_LANGUAGES)
	}

	/**
	 * @param {Array<AcceptStyleItem>} acceptLanguages (descending quality order)
	 * @param {Array<string>} supportedTypes (descending preferred order)
	 * @returns {AcceptStyleItem | undefined}
	 */
	static selectItemFrom(acceptLanguages, supportedTypes) {
		if(!isNonEmptyArray(acceptLanguages)) { return undefined }
		if(!isNonEmptyArray(supportedTypes)) { return undefined }

		// this assume acceptLangues is quality sorted descending order
		for(const acceptLanguage of acceptLanguages) {
			const { name } = acceptLanguage
			if(supportedTypes.includes(name)) {
				return acceptLanguage
			}
		}

		//
		if(acceptLanguages.some(item => item.name === LANGUAGE_ANY)) {
			const name = supportedTypes.at(0) // todo filter before lookup
			if(name === undefined) { return undefined }
			return { name }
		}

		return undefined
	}
}
