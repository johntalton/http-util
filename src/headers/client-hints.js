import { COMMON_LIST_HEADER_JOINER_COMMA } from "../defs.js"

export const CLIENT_HINT_USER_AGENT = 'Sec-CH-UA'
export const CLIENT_HINT_ARCHITECTURE = 'Sec-CH-UA-Arch'
export const CLIENT_HINT_BITNESS = 'Sec-CH-UA-Bitness'
export const CLIENT_HINT_FORM_FACTORS = 'Sec-CH-UA-Form-Factors'
// export const CLIENT_HINT_ = 'Sec-CH-UA-Full-Version'
export const CLIENT_HINT_VERSION_LIST = 'Sec-CH-UA-Full-Version-List'
export const CLIENT_HINT_MOBILE = 'Sec-CH-UA-Mobile'
export const CLIENT_HINT_MODEL = 'Sec-CH-UA-Model'
export const CLIENT_HINT_PLATFORM = 'Sec-CH-UA-Platform'
export const CLIENT_HINT_PLATFORM_VERSION = 'Sec-CH-UA-Platform-Version'
export const CLIENT_HINT_WOW64 = 'Sec-CH-UA-WoW64'
export const CLIENT_HINT_PREFERS_COLOR_SCHEME = 'Sec-CH-Prefers-Color-Scheme'
export const CLIENT_HINT_PREFERS_REDUCED_MOTION = 'Sec-CH-Prefers-Reduced-Motion'
export const CLIENT_HINT_PREFERS_REDUCED_TRANSPARENCY = 'Sec-CH-Prefers-Reduced-Transparency'
export const CLIENT_HINT_DEVICE_MEMORY = 'Sec-CH-Device-Memory'
export const CLIENT_HINT_DEVICE_PIXEL_RATIO = 'Sec-CH-DPR'
export const CLIENT_HINT_VIEWPORT_HEIGHT = 'Sec-CH-Viewport-Height'
export const CLIENT_HINT_VIEWPORT_WIDTH = 'Sec-CH-Viewport-Width'
export const CLIENT_HINT_IMAGE_WIDTH = 'Sec-CH-Width'
export const CLIENT_HINT_DOWNLINK = 'Downlink'
export const CLIENT_HINT_EFFECTIVE_CONNECTION_TYPE = 'ECT'
export const CLIENT_HINT_ROUND_TRIP_TIME = 'RTT'
export const CLIENT_HINT_SAVE_DATA = 'Save-Data'
export const CLIENT_HINT_GLOBAL_PRIVACY_CONTROL = 'Sec-GPC'

export const KNOWN_CLIENT_HINTS = [
	CLIENT_HINT_USER_AGENT,
	CLIENT_HINT_ARCHITECTURE,
	CLIENT_HINT_BITNESS,
	CLIENT_HINT_FORM_FACTORS,
	CLIENT_HINT_VERSION_LIST,
	CLIENT_HINT_MOBILE,
	CLIENT_HINT_MODEL,
	CLIENT_HINT_PLATFORM,
	CLIENT_HINT_PLATFORM_VERSION,
	CLIENT_HINT_WOW64,
	CLIENT_HINT_PREFERS_COLOR_SCHEME,
	CLIENT_HINT_PREFERS_REDUCED_MOTION,
	CLIENT_HINT_PREFERS_REDUCED_TRANSPARENCY,
	CLIENT_HINT_DEVICE_MEMORY,
	CLIENT_HINT_DEVICE_PIXEL_RATIO,
	CLIENT_HINT_VIEWPORT_HEIGHT,
	CLIENT_HINT_VIEWPORT_WIDTH,
	CLIENT_HINT_IMAGE_WIDTH,
	CLIENT_HINT_DOWNLINK,
	CLIENT_HINT_EFFECTIVE_CONNECTION_TYPE,
	CLIENT_HINT_ROUND_TRIP_TIME,
	CLIENT_HINT_SAVE_DATA,
	CLIENT_HINT_GLOBAL_PRIVACY_CONTROL
]

export const KNOWN_FORM_FACTORS = [
	'Desktop',
	'Automotive',
	'Mobile',
	'Tablet',
	'XR',
	'EInk',
	'Watch'
]

export const CLIENT_HINT_TRUE = '?1'
export const CLIENT_HINT_FALSE = '?0'


export class ClientHints {

	/**
	 * @param {Array<String>} hints
	 */
	static encode(hints) {
		if(hints === undefined) { return undefined }
		if(!Array.isArray(hints)) { return undefined }
		if(hints.length === 0) { return undefined }

		const remaining = hints
			.filter(hint => KNOWN_CLIENT_HINTS.includes(hint))

		if(remaining.length === 0) { return undefined }

		return remaining.join(COMMON_LIST_HEADER_JOINER_COMMA)
	}
}



