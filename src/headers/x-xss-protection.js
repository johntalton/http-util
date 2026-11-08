
export class XSSProtection {
	/**
	 * @param {boolean} [enable]
	 */
	static encode(enable) {
		if(enable === undefined) { return undefined }
		if(enable) { throw new TypeError('never enable this :)') }
		return '0'
	}
}
