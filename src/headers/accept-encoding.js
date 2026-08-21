import { COMMON_WILDCARD_ANY_ASTERISK, isNonEmptyArray } from '../defs.js'
import { DEFAULT_QUALITY, NOT_ACCEPTABLE_QUALITY, parseAcceptStyleHeader } from './util/accept-util.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */

export const ENCODING_ANY = COMMON_WILDCARD_ANY_ASTERISK

export const WELL_KNOWN_ENCODINGS = new Map([
	[ 'gzip, deflate, br, zstd', [ { name: 'gzip', quality: DEFAULT_QUALITY }, { name: 'deflate', quality: DEFAULT_QUALITY }, { name: 'br', quality: DEFAULT_QUALITY }, { name: 'zstd', quality: DEFAULT_QUALITY } ] ],
	[ 'gzip, deflate, br', [ { name: 'gzip', quality: DEFAULT_QUALITY }, { name: 'deflate', quality: DEFAULT_QUALITY }, { name: 'br', quality: DEFAULT_QUALITY } ] ],
	[ 'gzip, deflate', [ { name: 'gzip', quality: DEFAULT_QUALITY }, { name: 'deflate', quality: DEFAULT_QUALITY } ] ]
])

export class AcceptEncoding {
	/**
	 * @param {string|undefined} acceptEncodingHeader
	 */
	static parse(acceptEncodingHeader) {
		return parseAcceptStyleHeader(acceptEncodingHeader, WELL_KNOWN_ENCODINGS)
	}

	/**
	 * @param {Array<AcceptStyleItem>} acceptEncodings (descending quality order)
	 * @param {Array<string>} supportedTypes (descending preferred order)
	 * @returns {AcceptStyleItem | undefined}
	 */
	static selectItemFrom(acceptEncodings, supportedTypes) {
		if(acceptEncodings === undefined) { return undefined }
		if(!Array.isArray(acceptEncodings)) { return undefined }
		if(!isNonEmptyArray(supportedTypes)) { return undefined }

		if(acceptEncodings.length === 0) {
			// todo default to any when empty
		}

		for(const acceptEncoding of acceptEncodings) {
			if(acceptEncoding === undefined) { continue }
			const { name, quality } = acceptEncoding

			if(quality === NOT_ACCEPTABLE_QUALITY) { continue }

			if(supportedTypes.includes(name)) {
				return acceptEncoding
			 }
		}

		//
		const anyItem = acceptEncodings.find(item => item?.name === ENCODING_ANY && item?.quality !== NOT_ACCEPTABLE_QUALITY)
		if(anyItem !== undefined) {
			const [ name ] = supportedTypes
			if(name === undefined) { return undefined }
			return { ...anyItem, name }
		}

		return undefined
	}
}
