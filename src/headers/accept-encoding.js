import { isNonEmptyArray } from '../defs.js'
import { parseAcceptStyleHeader } from './util/accept-util.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */

export const ENCODING_ANY = '*'

export const WELL_KNOWN_ENCODINGS = new Map([
	[ 'gzip, deflate, br, zstd', [ { name: 'gzip' }, { name: 'deflate' }, { name: 'br' }, { name: 'zstd' } ] ],
	[ 'gzip, deflate, br', [ { name: 'gzip' }, { name: 'deflate' }, { name: 'br' } ] ],
	[ 'gzip, deflate', [ { name: 'gzip' }, { name: 'deflate' } ] ]
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
		if(!isNonEmptyArray(acceptEncodings)) { return undefined }
		if(!isNonEmptyArray(supportedTypes)) { return undefined }

		for(const acceptEncoding of acceptEncodings) {
			if(acceptEncoding === undefined) { continue }
			const { name } = acceptEncoding
			if(supportedTypes.includes(name)) {
				return acceptEncoding
			 }
		}

		//
		if(acceptEncodings.some(item => item?.name === ENCODING_ANY)) {
			const [ name ] = supportedTypes
			if(name === undefined) { return undefined }
			return { name } // todo include any quality and parameters
		}

		return undefined
	}
}
