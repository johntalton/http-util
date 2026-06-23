import { Assert } from './util/assert.js'
import { KVP } from './util/kvp.js'
import { MIME_ANY, Mime } from './util/mime.js'
import {
	MIME_TYPE_HTML,
	MIME_TYPE_JS,
	MIME_TYPE_JSON,
	MIME_TYPE_MESSAGE_HTTP,
	MIME_TYPE_TEXT,
	MIME_TYPE_XML,
	MIME_TYPE_YAML
} from './util/mime-types.js'

/** @import { MimeItem } from './util/mime.js' */

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

export const CHARSET_UTF8 = 'utf-8' // utf8
export const CHARSET = 'charset'
export const PARAMETER_CHARSET_UTF8 = `${CHARSET}${CONTENT_TYPE_SEPARATOR.KVP}${CHARSET_UTF8}`

export const CONTENT_TYPE_JSON = `${MIME_TYPE_JSON}` // match qpack (46)
export const CONTENT_TYPE_TEXT = `${MIME_TYPE_TEXT}${CONTENT_TYPE_SEPARATOR.PARAMETER}${PARAMETER_CHARSET_UTF8}`
export const CONTENT_TYPE_MESSAGE_HTTP = `${MIME_TYPE_MESSAGE_HTTP}`
export const CONTENT_TYPE_YAML = `${MIME_TYPE_YAML}`
export const CONTENT_TYPE_XML = `${MIME_TYPE_XML}`

export const CONTENT_TYPE_HTML = `${MIME_TYPE_HTML}${CONTENT_TYPE_SEPARATOR.PARAMETER}${PARAMETER_CHARSET_UTF8}`
export const CONTENT_TYPE_JS = `${MIME_TYPE_JS}${CONTENT_TYPE_SEPARATOR.PARAMETER}${PARAMETER_CHARSET_UTF8}`

/** @type {ContentTypeItem} */
export const WELL_KNOWN_JSON = {
	mimetype: MIME_TYPE_JSON,
	name: CONTENT_TYPE_JSON,
	type: 'application',
	subtype: 'json',
	charset: CHARSET_UTF8,
	parameters: new Map()
}

export const WELL_KNOWN_CONTENT_TYPES = new Map([
	[ 'application/json', WELL_KNOWN_JSON ],
	[ 'application/json;charset=utf8', WELL_KNOWN_JSON ]
])

export class ContentType {
	/**
	 * @param {string|undefined} header
	 * @returns {ContentTypeItem|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		// if(header === null) { return undefined }
		Assert.isString(header)

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
