
/**
 * @see {@link https://www.rfc-editor.org/rfc/rfc9745.html}
 */
export class Deprecation {
	/**
	 * @param {Temporal.Instant|Date|undefined} when
	 * @returns {string|undefined}
	 */
	static encode(when) {
		if(when === undefined) { return undefined }

		if(when instanceof Date) { throw new Error('not implemented') }

		// return StructuredField.encode(when, 'item')
		return `@${when.epochMilliseconds / 1000}`
	}
}
