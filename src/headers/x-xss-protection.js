
export const HTTP_HEADER_XSS_PROTECTION = 'x-xss-protection'

export class XSSProtection {
	/**
	 * @param {boolean} [enable]
	 */
	static encode(enable) {
		if(enable === undefined) { return undefined }
		if(enable) { throw new Error('never enable this :)') }
		return '0'
	}
}
