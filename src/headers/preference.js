// https://datatracker.ietf.org/doc/html/rfc7240
// https://www.rfc-editor.org/rfc/rfc7240#section-3

import { Assert } from './util/assert.js'
import { KVP } from './util/kvp.js'
import { isQuoted, stripQuotes } from './util/quote.js'

export const PREFERENCE_SEPARATOR = {
	PREFERENCE: ',',
	PARAMS: ';',
	PARAM_KVP: '=',
	KVP: '='
}

export const DIRECTIVE_RESPOND_ASYNC = 'respond-async'
export const DIRECTIVE_WAIT = 'wait'
export const DIRECTIVE_HANDLING = 'handling'
export const DIRECTIVE_REPRESENTATION = 'return'
export const DIRECTIVE_TIMEZONE = 'timezone'

export const DIRECTIVE_HANDLING_STRICT = 'strict'
export const DIRECTIVE_HANDLING_LENIENT = 'lenient'

export const DIRECTIVE_REPRESENTATION_MINIMAL = 'minimal'
export const DIRECTIVE_REPRESENTATION_HEADERS_ONLY = 'headers-only'
export const DIRECTIVE_REPRESENTATION_FULL = 'representation'

/**
 * @typedef {Object} Preference
 * @property {string|undefined} value
 * @property {Map<string, string|undefined>} parameters
 */

/**
 * @template P
 * @typedef {Object} RequestPreferencesBase
 * @property {boolean|undefined} [asynchronous]
 * @property {string|undefined} [representation]
 * @property {string|undefined} [handling]
 * @property {number|undefined} [wait]
 * @property {string|undefined} [timezone]
 * @property {Map<string, P>} preferences
 */

/** @typedef {RequestPreferencesBase<Preference>} RequestPreferences */
/** @typedef {RequestPreferencesBase<Partial<Omit<Preference,'parameters'>>|undefined>} AppliedRequestPreferences */

export class Preferences {
	/**
	 * @param {string|undefined} header
	 * @returns {RequestPreferences|undefined}
	 */
	static parse(header) {
		if(header === undefined) { return undefined }
		Assert.isString(header)

		const preferences = new Map(header.split(PREFERENCE_SEPARATOR.PREFERENCE)
			.map(pref => {
				const { name: kvp, parameters } = KVP.parse(pref) ?? { parameters: new Map() }
				const [ key, rawValue ] = kvp?.split(PREFERENCE_SEPARATOR.KVP) ?? []

				if(key === undefined) { return {} }
				const valueOrEmpty = isQuoted(rawValue) ? stripQuotes(rawValue) : rawValue
				const value = (valueOrEmpty !== '') ? valueOrEmpty : undefined

				return { key, value, parameters }
			})
			.filter(item => item.key !== undefined)
			.map(item => ([
				item.key,
				{ value: item.value, parameters: item.parameters }
			]))
		)

		//
		const asynchronous = preferences.get(DIRECTIVE_RESPOND_ASYNC) !== undefined
		const representation = preferences.get(DIRECTIVE_REPRESENTATION)?.value
		const handling = preferences.get(DIRECTIVE_HANDLING)?.value
		const wait = Number.parseInt(preferences.get(DIRECTIVE_WAIT)?.value ?? '', 10)
		const timezone = preferences.get(DIRECTIVE_TIMEZONE)?.value

		return {
			asynchronous,
			representation,
			handling,
			wait: Number.isFinite(wait) ? wait : undefined,
			timezone,
			preferences
		}
	}
}

export class AppliedPreferences {

	/**
	 * @param {Map<string, string|undefined>} preferences
	 */
	static #encode_Map(preferences) {
		return [ ...preferences.entries()
			.map(([ key, value ]) => {
				// todo check if value should be quoted
				if(value !== undefined) { return `${key}${PREFERENCE_SEPARATOR.KVP}${value}` }
				return key
			}) ]
			.join(PREFERENCE_SEPARATOR.PREFERENCE)
	}

	/**
	 * @param {Partial<AppliedRequestPreferences>|Map<string, string|undefined>|undefined} preferences
	 */
	static encode(preferences) {
		if(preferences === undefined) { return undefined}
		if(preferences instanceof Map) {
			return AppliedPreferences.#encode_Map(preferences)
		}

		const applied = new Map()

		for(const [ key, pref ] of preferences.preferences?.entries() ?? []) {
			applied.set(key, pref?.value)
		}

		if(preferences.asynchronous === true) { applied.set(DIRECTIVE_RESPOND_ASYNC, undefined) }
		if(preferences.asynchronous === false) { applied.delete(DIRECTIVE_RESPOND_ASYNC) }
		if(preferences.representation !== undefined) { applied.set(DIRECTIVE_REPRESENTATION, preferences.representation) }
		if(preferences.handling !== undefined) { applied.set(DIRECTIVE_HANDLING, preferences.handling) }
		if(preferences.wait !== undefined) { applied.set(DIRECTIVE_WAIT, preferences.wait) }
		if(preferences.timezone !== undefined) { applied.set(DIRECTIVE_TIMEZONE, preferences.timezone) }

		return AppliedPreferences.#encode_Map(applied)
	}
}
