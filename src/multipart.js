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


	static parse_Bytes(text, boundary, charset = 'utf8') {

	}

	/**
	 * @param {string} contentType
	 * @param {Array<MultipartBytePart>} parts
	 * @param {number|undefined} contentLength
	 * @param {string} boundary
	 * @returns {Generator<Uint8Array, void, unknown>}
	 */
	static *#encode_Bytes(contentType, parts, contentLength, boundary) {
		const boundaryBegin = `${BOUNDARY_MARK}${boundary}`
		const boundaryEnd = `${BOUNDARY_MARK}${boundary}${BOUNDARY_MARK}`

		const encoder = new TextEncoder()

		for(const part of parts) {
			yield encoder.encode(`${boundaryBegin}${MULTIPART_SEPARATOR}`)
			yield encoder.encode(`${MULTIPART_HEADER.CONTENT_TYPE}: ${contentType}${MULTIPART_SEPARATOR}`)
			yield encoder.encode(`${MULTIPART_HEADER.CONTENT_RANGE}: ${ContentRange.encode({ ...part.range, size: contentLength })}${MULTIPART_SEPARATOR}`)
			yield encoder.encode(MULTIPART_SEPARATOR)

			if(typeof part.obj === 'string') {
				yield encoder.encode(part.obj)
			}
			else {
				yield ArrayBuffer.isView(part.obj) ?
					new Uint8Array(part.obj.buffer, part.obj.byteOffset, part.obj.byteLength) :
					new Uint8Array(part.obj)
			}


			yield encoder.encode(MULTIPART_SEPARATOR)
		}

		yield encoder.encode(boundaryEnd)
	}


	/**
	 * @param {string} contentType
	 * @param {Array<MultipartBytePart>} parts
	 * @param {number|undefined} contentLength
	 * @param {string} boundary
	 */
	static encode_Bytes(contentType, parts, contentLength, boundary) {
		const allParts = Array.from(Multipart.#encode_Bytes(contentType, parts, contentLength, boundary))
		// return Buffer.concat([...allParts])

		const allPartsLength = allParts.reduce((acc, item) => acc + item.byteLength, 0)
		const result = new Uint8Array(allPartsLength)
		let offset = 0
		for(const allPart of allParts) {
			result.set(allPart, offset)
			offset += allPart.byteLength
		}
		return result
	}
}


function parseMultipartBody (body, boundary) {
  return body.split(`--${boundary}`).reduce((parts, part) => {
    if (part && part !== '--') {
      const [ head, body ] = part.trim().split(/\r\n\r\n/g)
      parts.push({
        body: body,
        headers: head.split(/\r\n/g).reduce((headers, header) => {
          const [ key, value ] = header.split(/:\s+/)
          headers[key.toLowerCase()] = value
          return headers
        }, {})
      })
    }
    return parts
  }, [])
}

// console.log(Multipart.encode_Bytes('text/plain', [
// 	{ obj: 'This is part A', range: { range: { start: 0, end: 14 }, size: 500 } },
// 	{ obj: 'this is part B', range: {} }
// ], 'FAKE_IT'))

// const body = Multipart.encode_Bytes('text/plain', [
// 	{ obj: Uint8Array.from([ 1,2,3,4 ]), range: { range: { start: 0, end: 14 }, size: 500 } },
// 	{ obj: 'this is part B', range: {} }
// ], 666, 'FAKE_IT')

// const decoder = new TextDecoder('utf8', { fatal: true })
// const encoder = new TextEncoder()
// const result = parseMultipartBody(decoder.decode(body), 'FAKE_IT')
// console.log(result.map(({ body }) => encoder.encode(body)))


// const test = '--X-INSOMNIA-BOUNDARY\r\n' +
//     'Content-Disposition: form-data; name="u"\r\n' +
//     '\r\n' +
//     'alice\r\n' +
//     '--X-INSOMNIA-BOUNDARY\r\n' +
//     'Content-Disposition: form-data; name="user"\r\n' +
//     '\r\n' +
//     'jeff\r\n' +
//     '--X-INSOMNIA-BOUNDARY--\r\n'
// const result = Multipart.parse(test, 'X-INSOMNIA-BOUNDARY')
// console.log(result)


// const test = [
// 	'-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
//  'Content-Disposition: form-data; '
//    + 'name="upload_file_0"; filename="テスト.dat"',
//  'Content-Type: application/octet-stream',
//  '',
//  'A'.repeat(1023),
//  '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
// ].join('\r\n')
// const result = Multipart.parse(test, '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k')
// console.log(result)


// const test = '--X-INSOMNIA-BOUNDARY--\r\n'
// const result = Multipart.parse(test, 'X-INSOMNIA-BOUNDARY')
// console.log(result)