import { parseAcceptStyleHeader } from './util/accept-util.js'
import { MIME_ANY, MIME_SEPARATOR, Mime } from './util/mime.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */
/** @import { MimeItem } from './util/mime.js' */

/** @typedef {AcceptStyleItem & MimeItem} AcceptItem */

export const WELL_KNOWN = new Map([
	[ '*/*', [ { name: '*/*', quality: 1 } ] ],
	[ 'application/json', [ { name: 'application/json', quality: 1 } ] ]
])

export const UNSPECIFIED_QUALITY = 1

export class Accept {
	/**
	 * Descending order based on quality and higher specificity.
	 *
	 * Returns negative is the first item (a) is of higher quality then second (b).
	 * @param {AcceptItem} a
	 * @param {AcceptItem} b
	 */
	static compare(a, b) {
		if(a.quality === b.quality) {
			// prefer things with less ANY
			const specificityA = (a.type === MIME_ANY ? 1 : 0) + (a.subtype === MIME_ANY ? 1 : 0)
			const specificityB = (b.type === MIME_ANY ? 1 : 0) + (b.subtype === MIME_ANY ? 1 : 0)
			return Math.sign(specificityA - specificityB)
		}

		// B - A descending order
		const qualityB = b.quality ?? UNSPECIFIED_QUALITY
		const qualityA = a.quality ?? UNSPECIFIED_QUALITY
		return Math.sign(qualityB - qualityA)
	}

	/**
	 * @param {string|undefined} acceptHeader
	 * @returns {Array<AcceptItem>}
	 */
	static parse(acceptHeader) {
		return parseAcceptStyleHeader(acceptHeader, WELL_KNOWN)
			.map(({ name, quality, parameters }) => {

				const mime = Mime.parse(name)
				if(mime === undefined) { return undefined }

				return {
					name,
					...mime,
					quality,
					parameters
				}
			})
			.filter(entry => entry !== undefined)
			.sort(Accept.compare)
	}

	/**
	 * @deprecated
	 * @see {@link Accept.selectItemFrom}
	 * @param {string|undefined} acceptHeader
	 * @param {Array<string>} supportedTypes
	 */
	static select(acceptHeader, supportedTypes) {
		const accepts = Accept.parse(acceptHeader)
		return Accept.selectFrom(accepts, supportedTypes)
	}

	/**
	 * @param {Array<AcceptItem>} accepts
	 * @param {Array<string>} supportedTypes
	 * @returns {AcceptItem | undefined}
	 */
	static selectItemFrom(accepts, supportedTypes) {
		if(accepts === undefined) { return undefined }
		if(!Array.isArray(accepts)) { return undefined }
		if(accepts.length === 0) { return undefined }

		if(supportedTypes === undefined) { return undefined }
		if(!Array.isArray(supportedTypes)) { return undefined }
		if(supportedTypes.length === 0) { return undefined }

		const supportedMimeTypes = supportedTypes
			.map(Mime.parse)
			.filter(m => m !== undefined)

		// todo if supportedMimeType has ANY show warning?

		if(supportedMimeTypes.length === 0) { return undefined }

		const matches = accepts.map(accept => {
			const matchSupportedMimeTypes = supportedMimeTypes.filter(mt => Mime.matches(accept, mt))
			const best = matchSupportedMimeTypes.at(0)
			if(best === undefined) { return undefined }

			// resolve mime type and subtype
			const type = best.type === MIME_ANY ? accept.type : best.type
			const subtype = best.subtype === MIME_ANY ? accept.subtype : best.subtype

			// preserve name and parameters of source
			return {
				...accept,
				mimetype: `${type}${MIME_SEPARATOR.SUBTYPE}${subtype}`,
				type,
				subtype
			}
		})
		.filter(m => m !== undefined)

		if(matches.length === 0) { return undefined }

		// sort is in-place
		matches.sort(Accept.compare)

		return matches.at(0)
	}

	/**
	 * @deprecated
	 * @see {@link Accept.selectItemFrom}
	 * @param {Array<AcceptItem>} accepts
	 * @param {Array<string>} supportedTypes
	 * @returns {string | undefined}
	 */
	static selectFrom(accepts, supportedTypes) {
		const item = Accept.selectItemFrom(accepts, supportedTypes)
		return item?.mimetype
	}
}
