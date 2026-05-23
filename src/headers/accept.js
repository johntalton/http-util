import { parseAcceptStyleHeader } from './util/accept-util.js'
import { MIME_ANY, Mime } from './util/mime.js'

/** @import { AcceptStyleItem } from './util/accept-util.js' */
/** @import { MimeItem } from './util/mime.js' */

/** @typedef {AcceptStyleItem & MimeItem} AcceptItem */

export const WELL_KNOWN = new Map([
	[ '*/*', [ { name: '*/*', quality: 1 } ] ],
	[ 'application/json', [ { name: 'application/json', quality: 1 } ] ]
])

export class Accept {
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
			.sort((entryA, entryB) => {
				if(entryA.quality === entryB.quality) {
					// prefer things with less ANY
					const specificityA = (entryA.type === MIME_ANY ? 1 : 0) + (entryA.subtype === MIME_ANY ? 1 : 0)
					const specificityB = (entryB.type === MIME_ANY ? 1 : 0) + (entryB.subtype === MIME_ANY ? 1 : 0)
					return specificityA - specificityB
				}

				// B - A descending order
				const qualityB = entryB.quality ?? 0
				const qualityA = entryA.quality ?? 0
				return qualityB - qualityA
			})
	}

	/**
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
	 */
	static selectFrom(accepts, supportedTypes) {
		const bests = accepts.map(accept => {
			const { type, subtype, quality } = accept
			const st = supportedTypes.filter(supportedType => {
				const supportedMime = Mime.parse(supportedType)
				if(supportedMime === undefined) { return false }
				return ((supportedMime.type === type || type === MIME_ANY) && (supportedMime.subtype === subtype || subtype === MIME_ANY))
			})

			return {
				supportedTypes: st,
				quality
			}
		})
		.filter(best => best.supportedTypes.length > 0)

		if(bests.length === 0) { return undefined }
		const [ first ] = bests
		if(first === undefined) { return undefined }
		const [ firstSt ] = first.supportedTypes
		return firstSt
	}
}

// console.log(Accept.parse('text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, text/*;q=.8, */*;q=0.7'))
// console.log(Accept.select('text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, text/*;q=.8, */*;q=0.7', [ 'application/json', 'text/plain' ]))
// console.log(Accept.parse('*'))


// const tests = [
// 	undefined,
// 	'',
// 	'	',
// 	' fake',
// 	'    application/json',
// 	' application/xml,',
// 	' ,application/xml   ,,',
// 	' audio/*; q=0.2, audio/basic',
// 	' text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8',
// 	' text/*;q=0.3, text/plain;q=0.7, text/plain;format=flowed,\ntext/plain;format=fixed;q=0.4, */*;q=0.5',

// 	' */*, foo/bar, foo/*, biz/bang, */*;q=.2, red/blue;q=.1',
// 	'foo / bar ; q = .5'
// ]

// tests.forEach(test => {
// 	const result = Accept.parse(test)
// 	console.log('=============================')
// 	console.log({ test })
// 	console.log('---')
// 	console.log(result)
// })

