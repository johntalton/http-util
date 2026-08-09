// https://www.rfc-editor.org/info/rfc9530/
// https://www.ietf.org/archive/id/draft-ietf-httpbis-unencoded-digest-05.html

import {
	SF_FIELD_TYPE_DICTIONARY,
	StructuredField
} from './structured-field/index.js'

/** @import { ItemOrInnerListWithParameters } from './structured-field/index.js' */

/** @typedef {{ bare_item: number, parameters: Map<string, any> }} WantDigestDictionaryItem */
/** @typedef {Map<string, WantDigestDictionaryItem>} WantDigestDictionary */


/** @typedef {{ algo: string, digest: ArrayBufferView|ArrayBuffer }} DigestItem */

export const DIGEST_ALGORITHM_SHA_256 = 'sha-256'
export const DIGEST_ALGORITHM_SHA_512 = 'sha-512'
export const DIGEST_ALGORITHM_MD5_DEPRECATED = 'md5'
export const DIGEST_ALGORITHM_SHA_1_DEPRECATED = 'sha'
export const DIGEST_ALGORITHM_UNIXSUM_DEPRECATED = 'unixsum'
export const DIGEST_ALGORITHM_UNIXCKSUM_DEPRECATED = 'unixcksum'
export const DIGEST_ALGORITHM_ADLER_32_DEPRECATED = 'adler'
export const DIGEST_ALGORITHM_CRC_32_C_DEPRECATED = 'crc32c'


export const KNOWN_DIGEST_ALGORITHMS = [
	DIGEST_ALGORITHM_SHA_256,
	DIGEST_ALGORITHM_SHA_512,
	DIGEST_ALGORITHM_MD5_DEPRECATED,
	DIGEST_ALGORITHM_SHA_1_DEPRECATED,
	DIGEST_ALGORITHM_UNIXSUM_DEPRECATED,
	DIGEST_ALGORITHM_UNIXCKSUM_DEPRECATED,
	DIGEST_ALGORITHM_ADLER_32_DEPRECATED,
	DIGEST_ALGORITHM_CRC_32_C_DEPRECATED
]

export class WantDigest {
	/**
	 * @param {Map<string, any>} dictionary
	 * @returns {WantDigestDictionary}
	 */
	static #validated(dictionary) {
		return new Map(dictionary.entries().filter(entry => {
			const [ _, value ] = entry
			const { bare_item } = value
			if(bare_item === undefined) { return false }
			if(!Number.isInteger(bare_item)) { return false }
			if(bare_item < 0) { return false }
			if(bare_item > 10) { return false }

			return true
		}))
	}

	/**
	 * @param {string|undefined} header
	 * @returns {WantDigestDictionary|undefined}
	 */
	static parse(header) {
		if (header === undefined) { return undefined }

		try {
			const dictionary = StructuredField.parse(header, SF_FIELD_TYPE_DICTIONARY, { })
			return WantDigest.#validated(dictionary)
		}
		catch {
			return undefined
		}
	}

	/**
	 * @param {WantDigestDictionary|undefined} dictionary
	 * @param {Array<string>} supportedAlgorithms
	 * @returns {[ string, WantDigestDictionaryItem ]|undefined}
	 */
	static selectItemFrom(dictionary, supportedAlgorithms) {
		if(dictionary === undefined) { return undefined }
		if(!Array.isArray(supportedAlgorithms)) { return undefined }
		if(supportedAlgorithms.length === 0) { return undefined }

		const sorted = dictionary.entries()
			.toArray()
			.toSorted((a, b) => b[1].bare_item - a[1].bare_item)
			.filter(entry => supportedAlgorithms.includes(entry[0]) && entry[1].bare_item !== 0)

		const first = sorted.at(0)
		return first
	}
}

export const WantReprDigest = WantDigest
export const WantContentDigest = WantDigest
export const WantUnencodedDigest = WantDigest


export class Digest {
	/**
	 * @param {DigestItem|undefined} digest
	 * @returns {string|undefined}
	 */
	static encode(digest) {
		if(digest === undefined) { return undefined }

		/** @type {Map<string, ItemOrInnerListWithParameters>} */
		const dictionary = new Map([
			[ digest.algo, { value: digest.digest, type: 'binary' } ]
		])

		try {
			return StructuredField.encode(dictionary)
		}
		catch {
			return undefined
		}
	}
}

export const ReprDigest = Digest
export const ContentDigest = Digest
export const UnencodedDigest = Digest
