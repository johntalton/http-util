
export const MIME_TYPE_JSON = 'application/json'
export const MIME_TYPE_TEXT = 'text/plain'
export const MIME_TYPE_EVENT_STREAM = 'text/event-stream'
export const MIME_TYPE_XML = 'application/xml'
export const MIME_TYPE_URL_FORM_DATA = 'application/x-www-form-urlencoded'
export const MIME_TYPE_MULTIPART_FORM_DATA = 'multipart/form-data'
export const MIME_TYPE_MULTIPART_RANGE = 'multipart/byteranges'
export const MIME_TYPE_OCTET_STREAM = 'application/octet-stream'
export const MIME_TYPE_MESSAGE_HTTP = 'message/http'


export const KNOWN_CONTENT_TYPES = [
	'application', 'audio', 'image', 'message',
	'multipart','text', 'video'
]

export const TYPE_X_TOKEN_PREFIX = 'X-'

export const SPECIAL_CHARS = [
	// special
	'(', ')', '<', '>',
	'@', ',', ';', ':',
	'\\', '"', '/', '[',
	']', '?', '.', '=',
	// space
	' ', '\u000B', '\u000C',
	// control
	'\n', '\r', '\t'
]

export const WHITESPACE_REGEX = /\s/

/**
 * @param {string} c
 */
export function isWhitespace(c){ return WHITESPACE_REGEX.test(c) }

/**
 * @param {string|undefined} value
 */
export function hasSpecialChar(value) {
  if(value === undefined) { return false }
  for(const special of SPECIAL_CHARS) {
    if(value.includes(special)) { return true}
  }

  return false
}

/**
 * @typedef {Object} ContentType
 * @property {string} mimetype
 * @property {string} mimetypeRaw
 * @property {string} type
 * @property {string} subtype
 * @property {string} [charset]
 * @property {Map<string, string>} parameters
 */

export const CONTENT_TYPE_SEPARATOR = {
	SUBTYPE: '/',
	PARAMETER: ';',
	KVP: '='
}

export const CHARSET_UTF8 = 'utf8'
export const CHARSET = 'charset'
export const PARAMETER_CHARSET_UTF8 = `${CHARSET}${CONTENT_TYPE_SEPARATOR.KVP}${CHARSET_UTF8}`
export const CONTENT_TYPE_JSON = `${MIME_TYPE_JSON}${CONTENT_TYPE_SEPARATOR.PARAMETER}${PARAMETER_CHARSET_UTF8}`
export const CONTENT_TYPE_TEXT = `${MIME_TYPE_TEXT}${CONTENT_TYPE_SEPARATOR.PARAMETER}${PARAMETER_CHARSET_UTF8}`
export const CONTENT_TYPE_MESSAGE_HTTP = `${MIME_TYPE_MESSAGE_HTTP}${CONTENT_TYPE_SEPARATOR.PARAMETER}${PARAMETER_CHARSET_UTF8}`

/** @type {ContentType} */
export const WELL_KNOWN_JSON = {
	mimetype: 'application/json',
	mimetypeRaw: 'application/json',
	type: 'application',
	subtype: 'json',
	charset: 'utf8',
	parameters: new Map()
}

export const WELL_KNOWN_CONTENT_TYPES = new Map([
	[ 'application/json', WELL_KNOWN_JSON ],
	[ 'application/json;charset=utf8', WELL_KNOWN_JSON ]
])


/**
 * @param {string|undefined} contentTypeHeader
 * @returns {ContentType|undefined}
 */
export function parseContentType(contentTypeHeader) {
	if(contentTypeHeader === undefined) { return undefined }
	if(contentTypeHeader === null) { return undefined }

	const wellKnown = WELL_KNOWN_CONTENT_TYPES.get(contentTypeHeader)
	if(wellKnown !== undefined) { return wellKnown }

	const [ mimetypeRaw, ...parameterSet ] = contentTypeHeader.split(CONTENT_TYPE_SEPARATOR.PARAMETER)
	if(mimetypeRaw === undefined) { return undefined }
	if(mimetypeRaw === '') { return undefined }

	const [ typeRaw, subtypeRaw ] = mimetypeRaw
		.split(CONTENT_TYPE_SEPARATOR.SUBTYPE)
		.map(t => t.toLowerCase())

	if(typeRaw === undefined) { return undefined }
	if(typeRaw === '') { return undefined }
	if(hasSpecialChar(typeRaw)) { return undefined }
	if(subtypeRaw === undefined) { return undefined }
	if(subtypeRaw === '') { return undefined }
	if(hasSpecialChar(subtypeRaw)) { return undefined }

	const type = typeRaw.trim()
	const subtype = subtypeRaw.trim()

	const parameters = new Map()

	for(const parameter of parameterSet) {
		const [ key, value ] = parameter.split(CONTENT_TYPE_SEPARATOR.KVP)
		if(key === undefined || key === '') { continue }
		if(value === undefined || value === '') { continue }
		if(hasSpecialChar(key)) { continue }

		const actualKey = key?.trim().toLowerCase()

		const quoted = (value.at(0) === '"' && value.at(-1) === '"')
		const actualValue = quoted ? value.substring(1, value.length - 1) : value

		if(!parameters.has(actualKey)) {
			parameters.set(actualKey, actualValue)
		}
	}

	const charset = parameters.get(CHARSET)

	return {
		mimetype: `${type}${CONTENT_TYPE_SEPARATOR.SUBTYPE}${subtype}`,
		mimetypeRaw, type, subtype,
		charset,
		parameters
	}
}

// console.log(parseContentType('multipart/form-data; boundary=----WebKitFormBoundaryJZy5maoMBkBMoGjt'))