

export const CONTENT_TYPE_OPTIONS_NOSNIFF = 'nosniff'

export class ContentTypeOptions {
	/**
	 * @param {boolean} [noSniff]
	 */
	static encode(noSniff) {
		if(noSniff === undefined) { return undefined }
		return noSniff ? CONTENT_TYPE_OPTIONS_NOSNIFF : undefined
	}
}
