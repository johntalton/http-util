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
	 * @param {string|undefined} acceptLanguageHeader
	 * @param {Array<string>} supportedTypes
	 */
	static select(acceptLanguageHeader, supportedTypes) {
		const accepts = AcceptLanguage.parse(acceptLanguageHeader)
		return AcceptLanguage.selectFrom(accepts, supportedTypes)
	}

	/**
	 * @param {Array<AcceptStyleItem>} acceptLanguages
	 * @param {Array<string>} supportedTypes
	 * @returns {AcceptStyleItem | undefined}
	 */
	static selectItemFrom(acceptLanguages, supportedTypes) {
		if(acceptLanguages === undefined) { return undefined }
		if(!Array.isArray(acceptLanguages)) { return undefined }
		if(acceptLanguages.length === 0) { return undefined }

		if(supportedTypes === undefined) { return undefined }
		if(!Array.isArray(supportedTypes)) { return undefined }
		if(supportedTypes.length === 0) { return undefined }

		for(const acceptLanguage of acceptLanguages) {
			const { name } = acceptLanguage
			if(supportedTypes.includes(name)) {
				return acceptLanguage
			}
		}

		//
		if(acceptLanguages.some(item => item.name === LANGUAGE_ANY)) {
			const name = supportedTypes.at(0)
			if(name === undefined) { return undefined }
			return { name }
		}

		return undefined
	}

	/**
	 * @param {Array<AcceptStyleItem>} acceptLanguages
	 * @param {Array<string>} supportedTypes
	 * @returns {string | undefined}
	 */
	static selectFrom(acceptLanguages, supportedTypes) {
		const item = AcceptLanguage.selectItemFrom(acceptLanguages, supportedTypes)
		return item?.name
	}
}
