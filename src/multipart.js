import { ReadableStream } from 'node:stream/web'

import { parseContentDisposition } from './content-disposition.js'
import { parseContentType } from './content-type.js'
import { ContentRange } from './content-range.js'

/** @import { ContentRangeDirective } from './content-range.js' */
/** @import { SendBody } from './response/send-util.js' */

/**
 * @typedef {Object} MultipartBytePart
 * @property {SendBody} obj
 * @property {ContentRangeDirective} range
 */

export const DISPOSITION_FORM_DATA = 'form-data'

export const BOUNDARY_MARK = '--'
export const MULTIPART_SEPARATOR = '\r\n'

export const HEADER_SEPARATOR = ':'

export const EMPTY = ''

export const MULTIPART_HEADER = {
	CONTENT_DISPOSITION: 'content-disposition',
	CONTENT_TYPE: 'content-type',
	CONTENT_RANGE: 'content-range'
}

export const MULTIPART_STATE = {
	BEGIN: 'begin',
	HEADERS: 'headers',
	VALUE: 'value',
	BEGIN_OR_END: 'beginOrEnd'
}

export class Multipart {
	/**
	 * @param {string} text
	 * @param {string} boundary
	 * @param {string} [charset='utf8']
	 */
	static parse(text, boundary, charset = 'utf8') {
		return Multipart.parse_FormData(text, boundary, charset)
	}

	/**
	 * @param {string} text
	 * @param {string} boundary
	 * @param {string} [charset='utf8']
	 */
	static parse_FormData(text, boundary, charset = 'utf8') {
		// console.log({ boundary, text })
		const formData = new FormData()

		if(text === '') {
			// empty body
			return formData
		}

		const lines = text.split(MULTIPART_SEPARATOR)

		if(lines.length === 0) {
			// missing body?
			return formData
		}

		const boundaryBegin = `${BOUNDARY_MARK}${boundary}`
		const boundaryEnd = `${BOUNDARY_MARK}${boundary}${BOUNDARY_MARK}`

		let partName = undefined
		let state = MULTIPART_STATE.BEGIN

		for(const line of lines) {
			// console.log('line', line)

			if(state === MULTIPART_STATE.BEGIN) {
				// expect boundary
				if(line === boundaryEnd) {
					// empty set
					break
				}

				if(line !== boundaryBegin) {
					throw new Error('missing beginning boundary')
				}
				state = MULTIPART_STATE.HEADERS
			}
			else if(state === MULTIPART_STATE.HEADERS) {
				if(line === EMPTY) { state = MULTIPART_STATE.VALUE }
				else {
					const [ rawName, value ] = line.split(HEADER_SEPARATOR)
					const name = rawName.toLowerCase()
					// console.log('header', name, value)
					if(name === MULTIPART_HEADER.CONTENT_TYPE) {
						const contentType = parseContentType(value)
						// console.log({ contentType })
					}
					else if(name === MULTIPART_HEADER.CONTENT_DISPOSITION) {
						const disposition = parseContentDisposition(value)
						if(disposition?.disposition !== DISPOSITION_FORM_DATA) {
							throw new Error('disposition not form-data')
						}

						// todo: are names always quoted?
						partName = disposition.name?.slice(1, -1)
					}
					else {
						// unsupported part header - ignore
						console.log('unsupported part header', name)
					}
				}
			}
			else if(state === MULTIPART_STATE.VALUE) {
				// console.log('value', line)
				if(partName === undefined) { throw new Error('unnamed part') }

				formData.append(partName, line)
				partName = undefined

				state = MULTIPART_STATE.BEGIN_OR_END
			}
			else if(state === MULTIPART_STATE.BEGIN_OR_END) {
				if(line === boundaryEnd) { break }
				if(line !== boundaryBegin) {
					throw new Error('missing boundary or end')
				}
				state = MULTIPART_STATE.HEADERS
			}
			else {
				throw new Error('unknown state')
			}

		}

		return formData
	}

	/**
	 * @param {string} contentType
	 * @param {Array<MultipartBytePart>} parts
	 * @param {number|undefined} contentLength
	 * @param {string} boundary
	 * @returns {ReadableStream<Uint8Array>}
	 */
	static encode_Bytes(contentType, parts, contentLength, boundary) {
		const boundaryBegin = `${BOUNDARY_MARK}${boundary}`
		const boundaryEnd = `${BOUNDARY_MARK}${boundary}${BOUNDARY_MARK}`

		return new ReadableStream({
			type: 'bytes',
			async start(controller) {
				const encoder = new TextEncoder()

				for (const part of parts) {
					controller.enqueue(encoder.encode(`${boundaryBegin}${MULTIPART_SEPARATOR}`))
					controller.enqueue(encoder.encode(`${MULTIPART_HEADER.CONTENT_TYPE}: ${contentType}${MULTIPART_SEPARATOR}`))
					controller.enqueue(encoder.encode(`${MULTIPART_HEADER.CONTENT_RANGE}: ${ContentRange.encode({ ...part.range, size: contentLength })}${MULTIPART_SEPARATOR}`))
					controller.enqueue(encoder.encode(MULTIPART_SEPARATOR))
					// controller.enqueue(encoder.encode(MULTIPART_SEPARATOR))

					if(part.obj instanceof ReadableStream) {
						for await (const chunk of part.obj) {
							if(chunk instanceof ArrayBuffer || ArrayBuffer.isView(chunk)) {
								controller.enqueue(chunk)
							}
							else if(typeof chunk === 'string'){
								controller.enqueue(encoder.encode(chunk))
							}
							else {
								// console.log('chunk type', typeof chunk)
								controller.enqueue(Uint8Array.from([ chunk ]))
							}
						}
					}
					else if(part.obj instanceof ArrayBuffer || ArrayBuffer.isView(part.obj)) {
						controller.enqueue(part.obj)
					}
					else if(typeof part.obj === 'string'){
						controller.enqueue(encoder.encode(part.obj))
					}
					else {
						// console.log('error', typeof part.obj, part.obj)
						throw new Error('unknown part type')
					}

					controller.enqueue(encoder.encode(MULTIPART_SEPARATOR))
				}

				controller.enqueue(encoder.encode(boundaryEnd))

      	controller.close()
			}
		})
	}
}
