/** biome-ignore-all lint/style/noExcessiveLinesPerFile: full serializer */
import {
	BINARY_ALPHABET,
	FEATURE_TEMPORAL,
	isAlpha,
	isDigit,
	isLCAlpha,
	isSP,
	isTChar,
	isVChar,
	PARSING_INPUT_JOINER,
	roundBankers,
	SF_AMPERSAND,
	SF_ASTERISK,
	SF_BOOLEAN_ONE,
	SF_BOOLEAN_ZERO,
	SF_COLON,
	SF_DASH,
	SF_DOUBLE_QUOTE,
	SF_EMPTY,
	SF_EQUALS,
	SF_FORWARD_SLASH,
	SF_INNER_LIST_CLOSE,
	SF_INNER_LIST_OPEN,
	SF_MAX_DECIMAL_PLACE,
	SF_MAX_DECIMAL_WHOLE,
	SF_MAX_INT,
	SF_MIN_INT,
	SF_NUMBER_TYPE_DECIMAL,
	SF_NUMBER_TYPE_INTEGER,
	SF_PERCENT,
	SF_PERIOD,
	SF_QUESTION_MARK,
	SF_SEMI_COLON,
	SF_SPACE,
	SF_UNDERSCORE,
	ZERO_REPLACING_REGEX
} from './defs.js'
import { SF_ERROR } from './errors.js'

/** @import { BareType } from './defs.js' */

/** @typedef {symbol|string} Token */

/**
 * @typedef {boolean|string|number|symbol|Date|Temporal.Instant|ArrayBufferView|ArrayBuffer|DisplayString|Token} BareItemType
 */

/**
 * @typedef {Object} ItemType
 * @property {BareItemType} value
 * @property {BareType|undefined} [type]
 */

/** @typedef {Map<string, ItemType|BareItemType>|undefined} ItemParametersType */

/**
 * @typedef {Object} ItemTypeWithParameters
 * @property {BareItemType} value
 * @property {BareType|undefined} [type]
 * @property {ItemParametersType} [parameters]
 */

/**
 * @typedef {Object} InnerListWithParameters
 * @property {Array<ItemTypeWithParameters>} value
 * @property {ItemParametersType} [parameters]
 */

/** @typedef {ItemTypeWithParameters | InnerListWithParameters} ItemOrInnerListWithParameters */

export class DisplayString extends String {}

export class SerializingError extends Error {
	/**
	 * @param {string} message
	 * @param {ErrorOptions} [options]
	 */
	constructor(message, options) {
		super(message, options)
		this.name = 'SerializingError'
	}
}

/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is Number}
 */
export function isTypeInteger(value, type_hint) {
	if(type_hint === SF_NUMBER_TYPE_INTEGER) { return true }
	if(type_hint === SF_NUMBER_TYPE_DECIMAL) { return false }
	if(type_hint !== undefined) { return false }
	if(!Number.isInteger(value)) { return false }
	if(Number.isFinite(value)) { return true }

	return false
}

/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is Number}
 */
export function isTypeDecimal(value, type_hint) {
	if(type_hint === SF_NUMBER_TYPE_DECIMAL) { return true }
	if(type_hint === SF_NUMBER_TYPE_INTEGER) { return false }
	if(type_hint !== undefined) { return false }
	if(typeof value === 'number') { return true }
	return false
}

/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is string}
 */
export function isTypeString(value, type_hint) {
	if(type_hint === 'string') { return true }
	if(type_hint !== undefined) { return false }
	if(typeof value === 'string') { return true }

	return false
}

/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is Token}
 */
export function isTypeToken(value, type_hint) {
	if(typeof value === 'symbol') { return true }
	if(type_hint === 'token') { return true }
	return false
}

/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is ArrayBuffer|ArrayBufferView}
 */
export function isTypeByteSequence(value, type_hint) {
	if(ArrayBuffer.isView(value)) { return true}
	if(value instanceof ArrayBuffer) { return true }
	if(type_hint === 'binary') { return true }
	return false
}

/**
 * @param {any|undefined} value
 * @param {BareType|undefined} type_hint
 * @returns {value is Boolean}
 */
export function isTypeBoolean(value, type_hint) {
	if(typeof value === 'boolean') { return true }
	if(type_hint === 'boolean') { return true }

	return false
}

/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is Date|Temporal.Instant}
 */
export function isTypeDate(value, type_hint) {
	if(value instanceof Date) { return true }
	if(FEATURE_TEMPORAL && value instanceof Temporal.Instant) { return true }
	if(type_hint === 'date') { return true }
	return false
}


/**
 * @param {BareItemType} value
 * @param {BareType|undefined} type_hint
 * @returns {value is DisplayString|string}
 */
export function isTypeDisplayString(value, type_hint) {
	if(value instanceof DisplayString) { return true }
	if(type_hint === 'displaystring') { return true }
	return false
}

/**
 * @param {BareItemType|undefined} item
 * @param {BareType|undefined} type_hint
 * @returns {item is BareItemType}
 */
export function isBareItem(item, type_hint) {
	if(item === undefined) { return false }

	if(isTypeBoolean(item, type_hint)) { return true }
	if(isTypeString(item, type_hint)) { return true }
	if(isTypeInteger(item, type_hint)) { return true }
	if(isTypeDecimal(item, type_hint)) { return true }
	if(isTypeToken(item, type_hint)) { return true }
	if(isTypeDate(item, type_hint)) { return true }
	if(isTypeByteSequence(item, type_hint)) { return true }

	return false
}

/**
 * @param {any} item
 * @returns {item is ItemType}
 */
export function isItemType(item) {
	if(typeof item !== 'object') { return false }
	return ('value' in item)
}

/**
 * @param {any} item
 * @returns {item is ItemTypeWithParameters}
 */
export function isItemTypeWithParameters(item) {
	if(typeof item !== 'object') { return false }
	return ('value' in item)
}


export class StructuredFieldSerializer {
	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-structured-fiel}
	 * @param {ItemTypeWithParameters|Map<string, ItemOrInnerListWithParameters>|Array<ItemOrInnerListWithParameters>} structure
	 * @returns {string|undefined}
	 */
	static serialize(structure) {
		if(structure === undefined) { return undefined }

		// 1. If the structure is a Dictionary or List and its value is empty (i.e., it has no members), do not serialize the field at all (i.e., omit both the field-name and field-value).
		// 2. If the structure is a List, let output_string be the result of running Serializing a List (Section 4.1.1) with the structure.
		if(Array.isArray(structure)) {
			if(structure.length === 0) { return undefined }
			return StructuredFieldSerializer.serializeList(structure)
		}

		// 3. Else, if the structure is a Dictionary, let output_string be the result of running Serializing a Dictionary (Section 4.1.2) with the structure.
		if(structure instanceof Map) {
			if(structure.size === 0) { return undefined }
			return StructuredFieldSerializer.serializeDictionary(structure)
		}

		// 4. Else, if the structure is an Item, let output_string be the result of running Serializing an Item (Section 4.1.3) with the structure.
		if(isItemTypeWithParameters(structure)) {
			return StructuredFieldSerializer.serializeItem(structure.value, structure.parameters, structure.type)
		}
		// if(isBareItem(structure, undefined)) { return StructuredFieldSerializer.serializeItem(structure, undefined, undefined) }

		// 5. Else, fail serialization.
		throw new SerializingError(SF_ERROR.SERIALIZER.UNKNOWN_TYPE)

		// 6. Return output_string converted into an array of bytes, using ASCII encoding [RFC0020].
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-list}
	 * @param {Array<ItemOrInnerListWithParameters>} list
	 * @returns {string}
	 */
	static serializeList(list) {
		// 1. Let output be an empty string.

		// 2. For each (member_value, parameters) of input_list:
		// 3. Return output.
		return list.map(({ value: member_value, parameters }) => {
			const { value: member_item, type: member_type_hint } = isItemType(member_value) ? member_value : { value: member_value  }

			// 1. If member_value is an array, append the result of running Serializing an Inner List (Section 4.1.1.1) with (member_value, parameters) to output.
			if(Array.isArray(member_item)) { return StructuredFieldSerializer.serializeInnerList(member_item, parameters) }

			// 2. Otherwise, append the result of running Serializing an Item (Section 4.1.3) with (member_value, parameters) to output.
			return StructuredFieldSerializer.serializeItem(member_item, parameters, member_type_hint)
		})
		// 3. If more member_values remain in input_list:
				// 1. Append "," to output.
				// 2. Append a single SP to output.
		.join(PARSING_INPUT_JOINER)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-an-inner-list}
	 * @param {Array<ItemTypeWithParameters>} value
	 * @param {ItemParametersType} parameters
	 * @returns {string}
	 */
	static serializeInnerList(value, parameters) {
		// 1. Let output be the string "(".

		// 2. For each (member_value, parameters) of inner_list:
		const listStr = value.map(({ value: member_value, parameters: member_param, type: member_type_hint }) => {
				// 1. Append the result of running Serializing an Item (Section 4.1.3) with (member_value, parameters) to output.
				return StructuredFieldSerializer.serializeItem(member_value, member_param, member_type_hint)
			})
			// 2. If more values remain in inner_list, append a single SP to output.
			.join(SF_SPACE)

		// 3. Append ")" to output.

		// 4. Append the result of running Serializing Parameters (Section 4.1.1.2) with list_parameters to output.
		const paramStr = StructuredFieldSerializer.serializeParameters(parameters)

		// 5. Return output.
		return `${SF_INNER_LIST_OPEN}${listStr}${SF_INNER_LIST_CLOSE}${paramStr}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-parameters}
	 * @param {ItemParametersType} parameters
	 * @returns {string}
	 */
	static serializeParameters(parameters) {
		if(parameters === undefined) { return SF_EMPTY }

		// 1. Let output be an empty string.
		// 2. For each param_key with a value of param_value in input_parameters:
		return parameters.entries().map(([ param_key, param_value ]) => {
			const { value: param_item, type: param_type_hint } = isItemType(param_value) ? param_value : { value: param_value  }
			// 1. Append ";" to output.

			// 2. Append the result of running Serializing a Key (Section 4.1.1.3) with param_key to output.
			const keyStr = StructuredFieldSerializer.serializeKey(param_key)

			if(param_item === true) { return `${SF_SEMI_COLON}${keyStr}` }

			// 3. If param_value is not Boolean true:
			// 1. Append "=" to output.
			// 2. Append the result of running Serializing a bare Item (Section 4.1.3.1) with param_value to output.
			const paramStr = StructuredFieldSerializer.serializeBareItem(param_item, param_type_hint)
			return `${SF_SEMI_COLON}${keyStr}${SF_EQUALS}${paramStr}`
		})
		.toArray()
		.join(SF_EMPTY)

		// 3. Return output.
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-key}
	 * @param {string} key
	 * @returns {string}
	 */
	static serializeKey(key) {
		// 1. Convert input_key into a sequence of ASCII characters; if conversion fails, fail serialization.
		// 2. If input_key contains characters not in lcalpha, DIGIT, "_", "-", ".", or "*", fail serialization.

		if([ ...key ].some(c => {
			if(isLCAlpha(c)) { return false }
			if(isDigit(c)) { return false }
			if(c === SF_UNDERSCORE) { return false }
			if(c === SF_DASH) { return false }
			if(c === SF_PERIOD) { return false }
			if(c === SF_ASTERISK) { return false }
			return true
		})) {
			throw new SerializingError(SF_ERROR.SERIALIZER.KEY_INVALID_CHAR)
		}

		// 3. If the first character of input_key is not lcalpha or "*", fail serialization.
		const first = key.at(0)
		if(!(isLCAlpha(first) || (first === SF_ASTERISK))) { throw new SerializingError(SF_ERROR.SERIALIZER.KEY_INVALID_FIRST_CHAR) }

		// 4. Let output be an empty string.
		// 5. Append input_key to output.
		// 6. Return output.
		return key
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-dictionary}
	 * @param {Map<string, ItemOrInnerListWithParameters>} dictionary
	 * @returns {string}
	 */
	static serializeDictionary(dictionary) {
		// 1. Let output be an empty string.
		// 2. For each member_key with a value of (member_value, parameters) in input_dictionary:
		return [ ...dictionary.entries().map(([ member_key, value ]) => {
			const { value: member_value_or_item, parameters } = value
			const { value: member_value, type: member_type_hint } = isItemTypeWithParameters(member_value_or_item) ? member_value_or_item : { value: member_value_or_item }

			// 1. Append the result of running Serializing a Key (Section 4.1.1.3) with member's member_key to output.
			let output = StructuredFieldSerializer.serializeKey(member_key)

			// 2. If member_value is Boolean true:
			if(member_value === true) {
				// 1. Append the result of running Serializing Parameters (Section 4.1.1.2) with parameters to output.
				output += StructuredFieldSerializer.serializeParameters(parameters)
			}
			// 3. Otherwise:
			else {
				// 1. Append "=" to output.
				output += SF_EQUALS

				// 2. If member_value is an array, append the result of running Serializing an Inner List (Section 4.1.1.1) with (member_value, parameters) to output.
				if(Array.isArray(member_value)) {
					output += StructuredFieldSerializer.serializeInnerList(member_value, parameters)
				}
				// 3. Otherwise, append the result of running Serializing an Item (Section 4.1.3) with (member_value, parameters) to output.
				else {
					output += StructuredFieldSerializer.serializeItem(member_value, parameters, member_type_hint)
				}
			}

			return output
		}) ]
			// 4. If more members remain in input_dictionary:
				// 1. Append "," to output.
				// 2. Append a single SP to output.
		.join(PARSING_INPUT_JOINER)

		// 3. Return output.
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-an-item}
	 * @param {ItemType|BareItemType} item
	 * @param {ItemParametersType} parameters
	 * @param {BareType|undefined} type_hint
	 * @returns {string}
	 */
	static serializeItem(item, parameters, type_hint) {
		// 1. Let output be an empty string.
		// 2. Append the result of running Serializing a Bare Item (Section 4.1.3.1) with bare_item to output.
		const itemStr = StructuredFieldSerializer.serializeBareItem(item, type_hint)

		// 3. Append the result of running Serializing Parameters (Section 4.1.1.2) with item_parameters to output.
		const paramStr = StructuredFieldSerializer.serializeParameters(parameters)

		// 4. Return output.
		return `${itemStr}${paramStr}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-bare-item}
	 * @param {ItemType|BareItemType} item
	 * @param {BareType|undefined} type_hint
	 * @returns {string}
	 */
	static serializeBareItem(item, type_hint) {
		const { value: local_item, type: local_type_hint } = isItemType(item) ? item : { value: item, type: type_hint }

		// 1. If input_item is an Integer, return the result of running Serializing an Integer (Section 4.1.4) with input_item.
		if(isTypeInteger(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeInteger(local_item) }

		// 2. If input_item is a Decimal, return the result of running Serializing a Decimal (Section 4.1.5) with input_item.
		if(isTypeDecimal(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeDecimal(local_item) }

		// 3. If input_item is a String, return the result of running Serializing a String (Section 4.1.6) with input_item.
		if(isTypeString(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeString(local_item) }

		// 4. If input_item is a Token, return the result of running Serializing a Token (Section 4.1.7) with input_item.
		if(isTypeToken(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeToken(local_item) }

		// 5. If input_item is a Byte Sequence, return the result of running Serializing a Byte Sequence (Section 4.1.8) with input_item.
		if(isTypeByteSequence(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeByteSequence(local_item) }

		// 6. If input_item is a Boolean, return the result of running Serializing a Boolean (Section 4.1.9) with input_item.
		if(isTypeBoolean(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeBoolean(local_item) }

		// 7. If input_item is a Date, return the result of running Serializing a Date (Section 4.1.10) with input_item.
		if(isTypeDate(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeDate(local_item) }

		// 8. If input_item is a Display String, return the result of running Serializing a Display String (Section 4.1.11) with input_item.
		if(isTypeDisplayString(local_item, local_type_hint)) { return StructuredFieldSerializer.serializeDisplayString(local_item) }

		// 9. Otherwise, fail serialization.
		throw new SerializingError(SF_ERROR.SERIALIZER.BARE_ITEM_UNKNOWN)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-an-integer}
	 * @param {number} num
	 * @returns {string}
	 */
	static serializeInteger(num) {
		// 1. If input_integer is not an integer in the range of -999,999,999,999,999 to 999,999,999,999,999 inclusive, fail serialization.
		if(num < SF_MIN_INT || num > SF_MAX_INT) { throw new SerializingError(SF_ERROR.SERIALIZER.INTEGER_OUT_OF_BOUNDS) }

		// 2. Let output be an empty string.
		// 3. If input_integer is less than (but not equal to) 0, append "-" to output.
		// 4. Append input_integer's numeric value represented in base 10 using only decimal digits to output.
		// 5. Return output.
		return `${num}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-decimal}
	 * @param {number} num
	 * @returns {string}
	 */
	static serializeDecimal(num) {
		// 1. If input_decimal is not a decimal number, fail serialization.
		if(!isTypeDecimal(num, undefined)) { throw new SerializingError(SF_ERROR.SERIALIZER.DECIMAL_NOT_A_DECIMAL) }

		// 2. If input_decimal has more than three significant digits to the right of the decimal point, round it to three decimal places, rounding the final digit to the nearest value, or to the even value if it is equidistant.
		const roundNum = roundBankers(num)

		// 3. If input_decimal has more than 12 significant digits to the left of the decimal point after rounding, fail serialization.
		if(Math.abs(Math.trunc(num)) > SF_MAX_DECIMAL_WHOLE) { throw new SerializingError(SF_ERROR.SERIALIZER.DECIMAL_OUT_OF_BOUNDS) }

		// 4. Let output be an empty string.
		// 5. If input_decimal is less than (but not equal to) 0, append "-" to output.
		// 6. Append input_decimal's integer component represented in base 10 (using only decimal digits) to output; if it is zero, append "0".
		// 7. Append "." to output.
		// 8. If input_decimal's fractional component is zero, append "0" to output.
		// 9. Otherwise, append the significant digits of input_decimal's fractional component represented in base 10 (using only decimal digits) to output.
		// 10. Return output.
		const intPart = Math.floor(roundNum / 1000).toString()
    const fracPart = (roundNum % 1000)
			.toString()
			.padStart(SF_MAX_DECIMAL_PLACE, '0')
			.replace(ZERO_REPLACING_REGEX, SF_EMPTY) || '0'

		return `${num < 0 ? SF_DASH : SF_EMPTY}${intPart}${SF_PERIOD}${fracPart}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-string}
	 * @param {string} str
	 * @returns {string}
	 */
	static serializeString(str) {
		// 1. Convert input_string into a sequence of ASCII characters; if conversion fails, fail serialization.

		// 2. If input_string contains characters in the range %x00-1f or %x7f-ff (i.e., not in VCHAR or SP), fail serialization.
		if([ ...str ].some(c => {
			if(isVChar(c)) { return false }
			if(isSP(c)) { return false }
			return true
		})) { throw new SerializingError(SF_ERROR.SERIALIZER.STRING_INVALID_CHAR) }

		// 3. Let output be the string DQUOTE.
		// 4. For each character char in input_string:
			// 1. If char is "\" or DQUOTE:
				// 1. Append "\" to output.
			// 2. Append char to output.
		const escapedStr = str.replaceAll('\\', '\\\\').replaceAll('"', '\\"')

		// 5. Append DQUOTE to output.
		// 6. Return output.
		return `${SF_DOUBLE_QUOTE}${escapedStr}${SF_DOUBLE_QUOTE}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-token}
	 * @param {Token} token
	 * @returns {string}
	 */
	static serializeToken(token) {
		// 1. Convert input_token into a sequence of ASCII characters; if conversion fails, fail serialization.
		const tokenStr = (typeof token === 'symbol') ? token.description : token
		if(tokenStr === undefined) { throw new SerializingError(SF_ERROR.SERIALIZER.TOKEN_UNDEFINED) }

		// 2. If the first character of input_token is not ALPHA or "*", or the remaining portion contains a character not in tchar, ":", or "/", fail serialization.
		const first = tokenStr.at(0)
		if(!(isAlpha(first) || (first === SF_ASTERISK))) { throw new SerializingError(SF_ERROR.SERIALIZER.TOKEN_INVALID_FIRST_CHAR) }
		if([ ...tokenStr ].some(c => {
			if(isTChar(c)) { return false }
			if(c === SF_COLON) { return false }
			if(c === SF_FORWARD_SLASH) { return false }
			return true
		})) {
			throw new SerializingError(SF_ERROR.SERIALIZER.TOKEN_INVALID_CHAR)
		}

		// 3. Let output be an empty string.
		// 4. Append input_token to output.
		// 5. Return output.
		return tokenStr
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-byte-sequence}
	 * @param {ArrayBufferView|ArrayBuffer} buffer
	 * @returns {string}
	 */
	static serializeByteSequence(buffer) {
		// 1. If input_bytes is not a sequence of bytes, fail serialization.
		if(!(buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer))) { throw new SerializingError(SF_ERROR.SERIALIZER.BYTE_SEQ_INVALID) }

		// 2. Let output be an empty string.
		// 3. Append ":" to output.
		// 4. Append the result of base64-encoding input_bytes as per [RFC4648], Section 4, taking account of the requirements below.
		const u8 = ArrayBuffer.isView(buffer) ?
			new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) :
			new Uint8Array(buffer)

		const base64 = u8.toBase64({ alphabet: BINARY_ALPHABET, omitPadding: false })

		// 5. Append ":" to output.
		// 6. Return output.
		return `${SF_COLON}${base64}${SF_COLON}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-boolean}
	 * @param {boolean} b
	 * @returns {string}
	 */
	static serializeBoolean(b) {
		// 1. If input_boolean is not a boolean, fail serialization.
		if(typeof b !== 'boolean') { throw new SerializingError(SF_ERROR.SERIALIZER.BOOLEAN_NOT_BOOLEAN) }

		// 2. Let output be an empty string.
		// 3. Append "?" to output.
		// 4. If input_boolean is true, append "1" to output.
		// 5. If input_boolean is false, append "0" to output.
		// 6. Return output.
		return `${SF_QUESTION_MARK}${b ? SF_BOOLEAN_ONE : SF_BOOLEAN_ZERO}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-date}
	 * @param {Date|Temporal.Instant} when
	 * @returns {string}
	 */
	static serializeDate(when) {
		const seconds = Math.floor((when instanceof Date) ? when.getTime() : when.epochMilliseconds) / 1000

		// 1. Let output be "@".
		// 2. Append to output the result of running Serializing an Integer with input_date (Section 4.1.4).
		const num = StructuredFieldSerializer.serializeInteger(seconds)
		// 3. Return output.
		return `${SF_AMPERSAND}${num}`
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-serializing-a-display-strin}
	 * @param {DisplayString} ds
	 * @returns {string}
	 */
	static serializeDisplayString(ds) {
		// todo not correctly lowercased
		// return `${SF_PERCENT}${SF_DOUBLE_QUOTE}${encodeURIComponent(ds.toString())}${SF_DOUBLE_QUOTE}`

		// 1. If input_sequence is not a sequence of Unicode code points, fail serialization.
		// 2. Let byte_array be the result of applying UTF-8 encoding (Section 3 of [UTF8]) to input_sequence. If encoding fails, fail serialization.
		const str = ds.toString()
		const encoder = new TextEncoder()
		const u8 = encoder.encode(str)

		// 3. Let encoded_string be a string containing "%" followed by DQUOTE.
		let encoded_string = `${SF_PERCENT}${SF_DOUBLE_QUOTE}`

		// 4. For each byte in byte_array:
		for(const c of u8) {
			const cc = String.fromCharCode(c)

			// 1. If byte is %x25 ("%"), %x22 (DQUOTE), or in the ranges %x00-1f or %x7f-ff:
			if(!isSP(cc) && (!isVChar(cc) || (cc === SF_PERCENT) || (cc === SF_DOUBLE_QUOTE))) {
				// 1. Append "%" to encoded_string.
				encoded_string += SF_PERCENT

				// 2. Let encoded_byte be the result of applying base16 encoding (Section 8 of [RFC4648]) to byte, with any alphabetic characters converted to lowercase.
				const encoded_byte = c.toString(16).toLowerCase()

				// 3. Append encoded_byte to encoded_string.
				encoded_string += encoded_byte
			}
			// 2. Otherwise, decode byte as an ASCII character and append the result to encoded_string.
			else {
				encoded_string += cc
			}
		}

		// 5. Append DQUOTE to encoded_string.
		encoded_string += SF_DOUBLE_QUOTE

		// 6. Return encoded_string.
		return encoded_string
	}

}
