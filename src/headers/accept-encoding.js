import { parseAcceptStyleHeader } from './util/accept-util.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */

export const ENCODING_ANY = '*'

export const WELL_KNOWN_ENCODINGS = new Map([
	[ 'gzip, deflate, br, zstd', [ { name: 'gzip' }, { name: 'deflate' }, { name: 'br' }, { name: 'zstd' } ] ],
	[ 'gzip, deflate, br', [ { name: 'gzip' }, { name: 'deflate' }, { name: 'br' } ] ]
])

export class AcceptEncoding {
	/**
	 * @param {string|undefined} acceptEncodingHeader
	 */
	static parse(acceptEncodingHeader) {
		return parseAcceptStyleHeader(acceptEncodingHeader, WELL_KNOWN_ENCODINGS)
	}

	/**
	 * @param {string|undefined} acceptEncodingHeader
	 * @param {Array<string>} supportedTypes
	 */
	static select(acceptEncodingHeader, supportedTypes) {
		const accepts = AcceptEncoding.parse(acceptEncodingHeader)
		return AcceptEncoding.selectFrom(accepts, supportedTypes)
	}

	/**
	 * @param {Array<AcceptStyleItem>} acceptEncodings
	 * @param {Array<string>} supportedTypes
	 * @returns {AcceptStyleItem | undefined}
	 */
	static selectItemFrom(acceptEncodings, supportedTypes) {
		if(acceptEncodings === undefined) { return undefined }
		if(!Array.isArray(acceptEncodings)) { return undefined }
		if(acceptEncodings.length === 0) { return undefined }

		if(supportedTypes === undefined) { return undefined }
		if(!Array.isArray(supportedTypes)) { return undefined }
		if(supportedTypes.length === 0) { return undefined }

		for(const acceptEncoding of acceptEncodings) {
			const { name } = acceptEncoding
			if(supportedTypes.includes(name)) {
				return acceptEncoding
			 }
		}

		//
		if(acceptEncodings.some(item => item.name === ENCODING_ANY)) {
			const [ name ] = supportedTypes
			if(name === undefined) { return undefined }
			return { name }
		}

		return undefined
	}

	/**
	 * @param {Array<AcceptStyleItem>} acceptEncodings
	 * @param {Array<string>} supportedTypes
	 * @returns {string | undefined}
	 */
	static selectFrom(acceptEncodings, supportedTypes) {
		const item = AcceptEncoding.selectItemFrom(acceptEncodings, supportedTypes)
		return item?.name
	}
}
