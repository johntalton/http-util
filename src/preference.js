// https://datatracker.ietf.org/doc/html/rfc7240
// https://www.rfc-editor.org/rfc/rfc7240#section-3

export const SEPARATOR = {
	PREFERENCE: ',',
	PARAMS: ';',
	PARAM_KVP: '=',
	KVP: '='
}

export const QUOTE = '"'

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
 * @param {string|undefined} value
 */
export function stripQuotes(value) {
	if(value === undefined) { return undefined }
	return value.substring(1, value.length - 1)
}

/**
 * @param {string|undefined} value
 */
export function isQuoted(value) {
	if(value === undefined) { return false }
	if(value.length < 2) { return false }
	if(!value.startsWith(QUOTE)) { return false }
	if(!value.endsWith(QUOTE)) { return false }
	return true
}

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

		const preferences = new Map(header.split(SEPARATOR.PREFERENCE)
			.map(pref => {
				const [ kvp, ...params ] = pref.trim().split(SEPARATOR.PARAMS)
				const [ key, rawValue ] = kvp?.split(SEPARATOR.KVP) ?? []

				if(key === undefined) { return {} }
				const valueOrEmpty = isQuoted(rawValue) ? stripQuotes(rawValue) : rawValue
				const value = (valueOrEmpty !== '') ? valueOrEmpty : undefined

				const parameters = new Map(params
					.map(param => {
						const [ pKey, rawPValue ] = param.split(SEPARATOR.PARAM_KVP)
						if(pKey === undefined) { return {} }
						const trimmedRawPValue = rawPValue?.trim()
						const pValueOrEmpty = isQuoted(trimmedRawPValue) ? stripQuotes(trimmedRawPValue) : trimmedRawPValue
						const pValue = (pValueOrEmpty !== '') ? pValueOrEmpty : undefined
						return { key: pKey.trim(), value: pValue }
					})
					.filter(item => item.key !== undefined)
					.map(item => ([ item.key, item.value ]))
				)

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
		const wait = parseInt(preferences.get(DIRECTIVE_WAIT)?.value ?? '')
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
				if(value !== undefined) { return `${key}${SEPARATOR.KVP}${value}` }
				return key
			}) ]
			.join(SEPARATOR.PREFERENCE)
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


// console.log(AppliedPreferences.encode(undefined))
// console.log(AppliedPreferences.encode({ }))
// console.log(AppliedPreferences.encode({ wait: 10 }))
// console.log(AppliedPreferences.encode({ asynchronous: undefined }))
// console.log(AppliedPreferences.encode({ asynchronous: false }))
// console.log(AppliedPreferences.encode({ asynchronous: true }))
// console.log(AppliedPreferences.encode({ preferences: new Map([
// 	[ 'respond-async', { value: undefined } ]
// ]) }))
// console.log(AppliedPreferences.encode({
// 	asynchronous: false,
// 	preferences: new Map([
// 	[ 'respond-async', { value: 'fake' } ]
// ]) }))
// console.log(AppliedPreferences.encode({ asynchronous: true, wait: 100 }))
// console.log(AppliedPreferences.encode({
// 	representation: DIRECTIVE_REPRESENTATION_MINIMAL,
// 	preferences: new Map([
// 		['foo', { value: 'bar', parameters: new Map([ [ 'biz', 'bang' ] ]) } ],
// 		[ 'fake', undefined ]
// 	])
// }))

// console.log(Preferences.parse('handling=lenient, wait=100, respond-async'))
// console.log(Preferences.parse(' foo; bar')?.preferences)
// console.log(Preferences.parse(' foo; bar=""')?.preferences)
// console.log(Preferences.parse(' foo=""; bar')?.preferences)
// console.log(Preferences.parse(' foo =""; bar;biz; bang ')?.preferences)
// console.log(Preferences.parse('return=minimal; foo="some parameter"')?.preferences)

// console.log(Preferences.parse('timezone=America/Los_Angeles'))
// console.log(Preferences.parse('return=headers-only'))
// console.log(Preferences.parse('return=minimal'))
// console.log(Preferences.parse('return=representation'))
// console.log(Preferences.parse('respond-async, wait=10`'))
// console.log(Preferences.parse('priority=5'))
// console.log(Preferences.parse('foo; bar'))
// console.log(Preferences.parse('foo; bar=""'))
// console.log(Preferences.parse('foo=""; bar'))
// console.log(Preferences.parse('handling=lenient, wait=100, respond-async'))
// console.log(Preferences.parse('return=minimal; foo="some parameter"'))
