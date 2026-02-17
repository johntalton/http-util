/** @typedef {'no-cache'|'no-store'|'no-transform'|'must-revalidate'|'immutable'|'must-understand'} Directives */

/**
 * @typedef {Object} CacheControlOptions
 * @property {boolean|undefined} [priv]
 * @property {boolean|undefined} [pub]
 * @property {number|undefined} [maxAge]
 * @property {number|undefined} [staleWhileRevalidate]
 * @property {number|undefined} [staleIfError]
 * @property {Directives|Array<Directives>|undefined} [directives]
 */

export class CacheControl {
	/**
	 * @param {CacheControlOptions|undefined} options
	 * @returns {string|undefined}
	 */
	static encode(options) {
		if(options === undefined) { return undefined }

		const {
			pub,
			priv,
			maxAge,
			directives,
			staleWhileRevalidate,
			staleIfError
		} = options

		const result = []

		if(pub !== undefined && pub && !priv) { result.push('public') }
		if(priv !== undefined && priv && !pub) { result.push('private') }

		if(directives !== undefined) {
			result.push(...(Array.isArray(directives) ? directives : [ directives ]))
		}

		if(maxAge !== undefined && Number.isInteger(maxAge) && maxAge >= 0) {
			result.push(`max-age=${maxAge}`)
		}

		if(staleWhileRevalidate !== undefined && Number.isInteger(staleWhileRevalidate) && staleWhileRevalidate >= 0) {
			result.push(`stale-while-revalidate=${staleWhileRevalidate}`)
		}

		if(staleIfError !== undefined && Number.isInteger(staleIfError) && staleIfError >= 0) {
			result.push(`stale-if-error=${staleIfError}`)
		}

		//
		if(result.length === 0) { return undefined }

		return result.join(', ')
	}
}

// console.log(CacheControl.encode({
// 	priv: true,
// 	maxAge: 60,
// 	directives: ['must-revalidate', 'no-transform']
// }))
