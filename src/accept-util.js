import { KVP } from './util/kvp.js'

export const QUALITY = 'q'
export const SEPARATOR = {
	MEDIA_RANGE: ','
}

export const DEFAULT_QUALITY_STRING = '1'

/**
 * @typedef {Object} AcceptStyleItem
 * @property {string} name
 * @property {number|undefined} [quality]
 * @property {Map<string, string>|undefined} [parameters]
 */

/**
 * @param {string|undefined} header
 * @param {Map<string, Array<AcceptStyleItem>>} [wellKnown]
 * @returns {Array<AcceptStyleItem>}
 */
export function parseAcceptStyleHeader(header, wellKnown) {
	if(header === undefined) { return [] }

	const wk = wellKnown?.get(header)
	if(wk !== undefined) { return wk }

	return header
		.trim()
			.split(SEPARATOR.MEDIA_RANGE)
			.map(mediaRange => {
				const { name, parameters } = KVP.parse(mediaRange) ?? { parameters: new Map() }
				if(name === undefined) { return undefined }
				if(name === '') { return undefined }

				const quality = Number.parseFloat(parameters.get(QUALITY) ?? DEFAULT_QUALITY_STRING)

				return {
					name,
					quality,
					parameters
				}
			})
			.filter(entry => entry !== undefined)
			.sort((entryA, entryB) => {
				// B - A descending order
				return entryB.quality - entryA.quality
			})
}
