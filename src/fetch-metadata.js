export const SEC_FETCH_MODE_NAVIGATE = 'navigate'
export const SEC_FETCH_MODE_NO_CORS = 'no-cors'
export const SEC_FETCH_MODE_CORS = 'cors'
export const SEC_FETCH_MODE_SAME_ORIGIN = 'same-origin'
export const SEC_FETCH_MODE_WEBSOCKET = 'websocket'
export const SEC_FETCH_MODE_WEBTRANSPORT = 'webtransport'
export const KNOWN_SEC_FETCH_MODES = [
	SEC_FETCH_MODE_NAVIGATE,
	SEC_FETCH_MODE_NO_CORS,
	SEC_FETCH_MODE_CORS,
	SEC_FETCH_MODE_SAME_ORIGIN,
	SEC_FETCH_MODE_WEBSOCKET,
	SEC_FETCH_MODE_WEBTRANSPORT
]

/**
 * @typedef {SEC_FETCH_MODE_NAVIGATE|SEC_FETCH_MODE_NO_CORS|SEC_FETCH_MODE_CORS|SEC_FETCH_MODE_SAME_ORIGIN|SEC_FETCH_MODE_WEBSOCKET|SEC_FETCH_MODE_WEBTRANSPORT} SecFetchMode
 */

export const SEC_FETCH_SITE_SAME_ORIGIN = 'same-origin'
export const SEC_FETCH_SITE_SAME_SITE = 'same-site'
export const SEC_FETCH_SITE_CROSS_SITE = 'cross-site'
export const SEC_FETCH_SITE_NONE = 'none'

export const KNOWN_SEC_FETCH_SITE = [
	SEC_FETCH_SITE_SAME_ORIGIN,
	SEC_FETCH_SITE_SAME_SITE,
	SEC_FETCH_SITE_CROSS_SITE,
	SEC_FETCH_SITE_NONE
]

/** @typedef {SEC_FETCH_SITE_SAME_ORIGIN|SEC_FETCH_SITE_SAME_SITE|SEC_FETCH_SITE_CROSS_SITE|SEC_FETCH_SITE_NONE} SecFetchSite */

export const SEC_FETCH_DEST_AUDIO = 'audio'
export const SEC_FETCH_DEST_AUDIO_WORKLET = 'audioworklet'
export const SEC_FETCH_DEST_DOCUMENT = 'document'
export const SEC_FETCH_DEST_EMBED = 'embed'
export const SEC_FETCH_DEST_FONT = 'font'
export const SEC_FETCH_DEST_FRAME = 'frame'
export const SEC_FETCH_DEST_IFRAME = 'iframe'
export const SEC_FETCH_DEST_IMAGE = 'image'
export const SEC_FETCH_DEST_JSON = 'json'
export const SEC_FETCH_DEST_MANIFEST = 'manifest'
export const SEC_FETCH_DEST_OBJECT = 'object'
export const SEC_FETCH_DEST_PAINT_WORKLET = 'paintworklet'
export const SEC_FETCH_DEST_REPORT = 'report'
export const SEC_FETCH_DEST_SCRIPT = 'script'
export const SEC_FETCH_DEST_SERVICE_WORKER = 'serviceworker'
export const SEC_FETCH_DEST_SHARED_WORKER = 'sharedworker'
export const SEC_FETCH_DEST_STYLE = 'style'
export const SEC_FETCH_DEST_TEXT = 'text'
export const SEC_FETCH_DEST_TRACK = 'track'
export const SEC_FETCH_DEST_VIDEO = 'video'
export const SEC_FETCH_DEST_WEB_IDENTITY = 'webidentity'
export const SEC_FETCH_DEST_WORKER = 'worker'
export const SEC_FETCH_DEST_XSLT = 'xslt'

export const SEC_FETCH_DEST_EMPTY = 'empty'

export const KNOWN_SEC_FETCH_DEST = [
	SEC_FETCH_DEST_AUDIO,
	SEC_FETCH_DEST_AUDIO_WORKLET,
	SEC_FETCH_DEST_DOCUMENT,
	SEC_FETCH_DEST_EMBED,
	SEC_FETCH_DEST_FONT,
	SEC_FETCH_DEST_FRAME,
	SEC_FETCH_DEST_IFRAME,
	SEC_FETCH_DEST_IMAGE,
	SEC_FETCH_DEST_JSON,
	SEC_FETCH_DEST_MANIFEST,
	SEC_FETCH_DEST_OBJECT,
	SEC_FETCH_DEST_PAINT_WORKLET,
	SEC_FETCH_DEST_REPORT,
	SEC_FETCH_DEST_SCRIPT,
	SEC_FETCH_DEST_SERVICE_WORKER,
	SEC_FETCH_DEST_SHARED_WORKER,
	SEC_FETCH_DEST_STYLE,
	SEC_FETCH_DEST_TEXT,
	SEC_FETCH_DEST_TRACK,
	SEC_FETCH_DEST_VIDEO,
	SEC_FETCH_DEST_WEB_IDENTITY,
	SEC_FETCH_DEST_WORKER,
	SEC_FETCH_DEST_XSLT,
	SEC_FETCH_DEST_EMPTY
]

/** @typedef {
	SEC_FETCH_DEST_AUDIO|
	SEC_FETCH_DEST_AUDIO_WORKLET|
	SEC_FETCH_DEST_DOCUMENT|
	SEC_FETCH_DEST_EMBED|
	SEC_FETCH_DEST_FONT|
	SEC_FETCH_DEST_FRAME|
	SEC_FETCH_DEST_IFRAME|
	SEC_FETCH_DEST_IMAGE|
	SEC_FETCH_DEST_JSON|
	SEC_FETCH_DEST_MANIFEST|
	SEC_FETCH_DEST_OBJECT|
	SEC_FETCH_DEST_PAINT_WORKLET|
	SEC_FETCH_DEST_REPORT|
	SEC_FETCH_DEST_SCRIPT|
	SEC_FETCH_DEST_SERVICE_WORKER|
	SEC_FETCH_DEST_SHARED_WORKER|
	SEC_FETCH_DEST_STYLE|
	SEC_FETCH_DEST_TEXT|
	SEC_FETCH_DEST_TRACK|
	SEC_FETCH_DEST_VIDEO|
	SEC_FETCH_DEST_WEB_IDENTITY|
	SEC_FETCH_DEST_WORKER|
	SEC_FETCH_DEST_XSLT|
	SEC_FETCH_DEST_EMPTY
} SecFetchDest */

export class SecFetch {
	/**
	 * @param {string|undefined} header
	 * @returns {header is SecFetchSite}
	 */
	static #isSite(header) {
		if(header === undefined) { return false }
		return KNOWN_SEC_FETCH_SITE.includes(header)
	}

	/**
	 * @param {string|undefined} header
	 * @returns {SecFetchSite|undefined}
	 */
	static parseSite(header) {
		if(!SecFetch.#isSite(header)) { return undefined }
		return header
	}

	/**
	 * @param {string|undefined} header
	 * @returns {header is SecFetchMode}
	 */
	static #isMode(header) {
		if(header === undefined) { return false }
		return KNOWN_SEC_FETCH_MODES.includes(header)
	}

	/**
	 * @param {string|undefined} header
	 * @returns {SecFetchMode|undefined}
	 */
	static parseMode(header) {
		if(!SecFetch.#isMode(header)) { return undefined }
		return header
	}

	/**
	 * @param {string|undefined} header
	 * @return {header is SecFetchDest}
	 */
	static #isDest(header) {
		if(header === undefined) { return false }
		return KNOWN_SEC_FETCH_DEST.includes(header)
	}

	/**
	 * @param {string|undefined} header
	 * @returns {SecFetchDest|undefined}
	 */
	static parseDestination(header) {
		if(!SecFetch.#isDest(header)) { return undefined }
		return header
	}
}
