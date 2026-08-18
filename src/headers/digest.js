// https://www.rfc-editor.org/info/rfc9530/
// https://www.ietf.org/archive/id/draft-ietf-httpbis-unencoded-digest-05.html

import { normalizeToArray } from '../defs.js'
import {
	SF_FIELD_TYPE_DICTIONARY,
	StructuredField
} from './structured-field/index.js'

/** @import { ItemOrInnerListWithParameters, ItemTypeWithParameters } from './structured-field/index.js' */

/** @typedef {{ preference: number, parameters: Map<string, any> }} WantDigestDictionaryItem */
/** @typedef {Map<string, WantDigestDictionaryItem>} WantDigestDictionary */

/** @typedef {Map<string, number>} WantDigestInput */

/** @typedef {{ algo: string, digest: ArrayBufferView|ArrayBuffer }} DigestItem */

/** @typedef {Map<string, { bare_item: ArrayBuffer|ArrayBufferView }>} DigestDictionary */

/** @typedef {(DigestItem & { auto: false }) | { algo: string, auto: true }} AutoDigestItem */

/** @typedef {WantDigestDictionaryItem & { algo: string }} SelectedDigestResult */

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

export const DIGEST_PREFERENCE_MIN = 0
export const DIGEST_PREFERENCE_MAX = 10
export const DIGEST_PREFERENCE_NOT_ACCEPTABLE = 0

export class WantDigest {
	/**
	 * @param {Map<string, any>} dictionary
	 * @returns {WantDigestDictionary}
	 */
	static #validated(dictionary) {
		return new Map(dictionary.entries()
			.filter(entry => {
				const [ _, value ] = entry
				const { bare_item } = value
				if(bare_item === undefined) { return false }
				if(!Number.isInteger(bare_item)) { return false }
				if(bare_item < DIGEST_PREFERENCE_MIN) { return false }
				if(bare_item > DIGEST_PREFERENCE_MAX) { return false }

				return true
			})
			.map(entry => {
				const [ key, value ] = entry
				return [ key, {
					preference: value.bare_item,
					parameters: value.parameters } ]
			})
		)
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
	 * @returns {Array<SelectedDigestResult>|undefined}
	 */
	static selectItemsFrom(dictionary, supportedAlgorithms) {
		if(dictionary === undefined) { return undefined }
		if(!Array.isArray(supportedAlgorithms)) { return undefined }
		if(supportedAlgorithms.length === 0) { return undefined }

		return dictionary.entries()
			.toArray()
			.toSorted((a, b) => b[1].preference - a[1].preference)
			.filter(entry => supportedAlgorithms.includes(entry[0]) && entry[1].preference !== DIGEST_PREFERENCE_NOT_ACCEPTABLE)
			.map(entry => ({ algo: entry[0], preference: entry[1].preference, parameters: entry[1].parameters }))
	}

	/**
	 * @param {WantDigestInput|undefined} dictionary
	 * @returns {string|undefined}
	 */
	static encode(dictionary) {
		if(dictionary === undefined) { return undefined }
		if(!(dictionary instanceof Map)) { return undefined }

		/** @type {Map<string, ItemTypeWithParameters>} */
		const structure = new Map(dictionary
			.entries()
			.toArray()
			.map(entry =>
				[ entry[0], { value: entry[1], type: 'integer' }]
		))

		try {
			return StructuredField.encode(structure)
		}
		catch {
			return undefined
		}
	}
}

export const WantReprDigest = WantDigest
export const WantContentDigest = WantDigest
export const WantUnencodedDigest = WantDigest


export class Digest {
	/**
	 * @param {string|undefined} header
	 * @returns {DigestDictionary|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }

		try {
			return StructuredField.parse(header, SF_FIELD_TYPE_DICTIONARY, { })
		}
		catch {
			return undefined
		}
	}

	/**
	 * @param {Array<DigestItem>|DigestItem|undefined} digest
	 * @returns {string|undefined}
	 */
	static encode(digest) {
		if(digest === undefined) { return undefined }

		/** @type {Map<string, ItemOrInnerListWithParameters>} */
		const dictionary = new Map(normalizeToArray(digest).map(item => ([
			item.algo, { value: item.digest, type: 'binary'}
		])))

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
