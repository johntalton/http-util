import { COMMON_WILDCARD_ANY_ASTERISK, isNonEmptyArray } from '../defs.js'
import { NOT_ACCEPTABLE_QUALITY, parseAcceptStyleHeader } from './util/accept-util.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */

export const LANGUAGE_ANY = COMMON_WILDCARD_ANY_ASTERISK

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
		// todo this does NOT follow https://www.rfc-editor.org/rfc/rfc4647.html

		if(acceptLanguages === undefined) { return undefined }
		if(!Array.isArray(acceptLanguages)) { return undefined }
		if(!isNonEmptyArray(supportedTypes)) { return undefined }

		if(acceptLanguages.length === 0) {
			// todo default to any when empty
		}

		// this assume acceptLangues is quality sorted descending order
		for(const acceptLanguage of acceptLanguages) {
			if(acceptLanguage === undefined) { continue }
			const { name, quality } = acceptLanguage

			if(quality === NOT_ACCEPTABLE_QUALITY) { continue }

			if(supportedTypes.includes(name)) {
				return acceptLanguage
			}
		}

		//
		const anyItem = acceptLanguages.find(item => item?.name === LANGUAGE_ANY && item?.quality !== NOT_ACCEPTABLE_QUALITY)
		if(anyItem !== undefined) {
			const [ name ] = supportedTypes
			if(name === undefined) { return undefined }
			return { ...anyItem, name}
		}

		return undefined
	}
}
