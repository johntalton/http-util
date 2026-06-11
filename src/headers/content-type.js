import { KVP } from './util/kvp.js'
import { MIME_ANY, Mime } from './util/mime.js'

/** @import { MimeItem } from './util/mime.js' */

export const MIME_TYPE_JSON = 'application/json'
export const MIME_TYPE_TEXT = 'text/plain'
export const MIME_TYPE_EVENT_STREAM = 'text/event-stream'
export const MIME_TYPE_XML = 'application/xml'
export const MIME_TYPE_URL_FORM_DATA = 'application/x-www-form-urlencoded'
export const MIME_TYPE_MULTIPART_FORM_DATA = 'multipart/form-data'
export const MIME_TYPE_MULTIPART_RANGE = 'multipart/byteranges'
export const MIME_TYPE_OCTET_STREAM = 'application/octet-stream'
export const MIME_TYPE_MESSAGE_HTTP = 'message/http'
export const MIME_TYPE_YAML = 'application/yaml'
export const MIME_TYPE_PROTOBUF = 'application/protobuf'

export const KNOWN_CONTENT_TYPES = [
	'application', 'audio', 'image', 'message',
	'multipart', 'text', 'video'
]

export const TYPE_X_TOKEN_PREFIX = 'X-'

/**
 * @typedef {Object} ContentTypeExtension
 * @property {string} name
 * @property {string} [charset]
 * @property {Map<string, string>} parameters
 */

/** @typedef {MimeItem & ContentTypeExtension} ContentTypeItem */

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

/** @type {ContentTypeItem} */
export const WELL_KNOWN_JSON = {
	mimetype: MIME_TYPE_JSON,
	name: MIME_TYPE_JSON,
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
 * @deprecated
 * @see {@link ContentType.parse}
 * @param {string|undefined} contentTypeHeader
 * @returns {ContentTypeItem|undefined}
 */
export function parseContentType(contentTypeHeader) {
	return ContentType.parse(contentTypeHeader)
}

export class ContentType {
	/**
	 * @param {string|undefined} header
	 * @returns {ContentTypeItem|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		if(header === null) { return undefined }

		const wellKnown = WELL_KNOWN_CONTENT_TYPES.get(header)
		if(wellKnown !== undefined) { return wellKnown }

		const { name, parameters } = KVP.parse(header) ?? { parameters: new Map() }
		if(name === undefined) { return undefined }

		const mimetype = Mime.parse(name)
		if(mimetype === undefined) { return undefined }

		if(mimetype.type === MIME_ANY) { return undefined }
		if(mimetype.subtype === MIME_ANY) { return undefined }

		const charset = parameters?.get(CHARSET)

		return {
			...mimetype,
			name,
			charset,
			parameters
		}
	}
}
