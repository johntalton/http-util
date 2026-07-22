/** biome-ignore-all lint/style/noExcessiveLinesPerFile: full parser */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: some complexity exists */
/** biome-ignore-all lint/style/noNestedTernary: used */
import {
	BINARY_ALPHABET,
	isAlpha,
	isDecimal,
	isDigit,
	isLCAlpha,
	isSP,
	isTChar,
	isVChar,
	PARSING_INPUT_JOINER,
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
	SF_NUMBER_TYPE_DECIMAL,
	SF_NUMBER_TYPE_INTEGER,
	SF_PERCENT,
	SF_PERIOD,
	SF_QUESTION_MARK,
	SF_SEMI_COLON,
	SF_SPACE,
	SF_UNDERSCORE,
} from './defs.js'
import { SF_ERROR } from './errors.js'
import { NativeFormatter } from './formatter.js'

/** @import { NumberType, FieldType } from './defs.js' */
/** @import { ParsingFormat } from './formatter.js' */

/** @typedef {string|ArrayBuffer|Uint8Array|InputString|undefined} ParsingInput */

/**
 * @typedef {Object} ParsingOptions
 * @property {'loose' | 'strict' | 'stop-before-partial'} [lastChunkHandling] - base64 processing
 * @property {ParsingFormat} [format]
*/

export const SF_DEFAULT_FORMATTER = NativeFormatter

export const BASE_10 = 10
export const BASE_16 = 16
export const UTF_8 = 'utf-8'

export const SF_FIELD_TYPE_LIST = 'list'
export const SF_FIELD_TYPE_DICTIONARY = 'dictionary'
export const SF_FIELD_TYPE_ITEM = 'item'

//
export const SF_TAB = '\t'
export const SF_BACK_SLASH = '\\'

export const SF_COMMA = ','
export const SF_PLUS = '+'

//
export const SF_MAX_INPUT_NUMBER_LENGTH = 12
export const SF_MAX_INPUT_NUMBER_INTEGER_LENGTH = 15
export const SF_MAX_INPUT_NUMBER_DECIMAL_LENGTH = 16

/**
 * @see {@link https://www.rfc-editor.org/info/rfc9110#section-5.6.3}
 * @param {string|undefined} c
 */
export function isOWS(c) {
	return (c === SF_SPACE) || (c === SF_TAB)
}

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4648#section-8}
 * @param {string|undefined} c
 */
export function isLowercaseHex(c) {
	// %x30-39 or %x61-66
	if(c === undefined) { return false }
	if(isDigit(c)) { return true }
	const cc = c.charCodeAt(0)
	return (cc >= 0x61) && (cc <= 0x66)
}

/**
 * @see {@link https://tc39.es/ecma262/multipage/indexed-collections.html#standard-base64-alphabet}
 * @param {string|undefined} str
 */
export function isBase64Alphabet(str) {
	if(str === undefined) { return false }

	for(const c of str) {
		if(!((isAlpha(c)) ||
				(isDigit(c)) ||
				(c === SF_PLUS) ||
				(c === SF_FORWARD_SLASH) ||
				(c === SF_EQUALS))) { return false }
	}

	return true
}

export class ParsingError extends Error {
	/**
	 * @param {string} message
	 * @param {InputString} input
	 * @param {ErrorOptions} [options]
	 */
	constructor(message, input, options) {
		super(`${message} @ position: ${input.position}`, options)
		this.name = 'ParsingError'
	}
}

export class InputString {
	#input
	#position

	/**
	 * @param {string|undefined} input
	 * @param {number} [position]
	 */
	constructor(input, position = 0) {
		this.#input = input
		this.#position = position
	}

	/**
	 * @returns {number}
	 */
	get position() { return this.#position }

	/**
	 * @returns {string|undefined}
	 */
	get input() { return this.#input?.slice(this.#position) }

	/**
	 * @returns {string|undefined}
	 */
	peek() { return this.#input?.at(this.#position) }

	/**
	 * @returns {string|undefined}
	 */
	consume() {
		if(this.#input === undefined) { return undefined }
		if(this.#position >= this.#input.length) { return undefined }

		const c = this.#input.at(this.#position)
		this.#position += 1
		return c
	}

	/**
	 * @returns {void}
	 */
	unConsume() {
		this.#position -= 1
	}

	/**
	 * @returns {void}
	 */
	discardSP() {
		while(isSP(this.peek())) { this.consume() }
	}

	/**
	 * @returns {void}
	 */
	discardOWS() {
		while(isOWS(this.peek())) { this.consume() }
	}

	/**
	 * @returns {boolean}
	 */
	isEmpty() {
		if(this.#input === undefined) { return true }
		return this.#position >= this.#input.length
	}

	/**
	 * @param {string} search
	 * @returns {number}
	 */
	indexOf(search) {
		if(this.#input === undefined) { return -1 }
		return this.#input.indexOf(search, this.#position)
	}

	/**
	 * @param {number} index
	 * @returns {string}
	 */
	consumeUntil(index) {
		if(this.#input === undefined) { return SF_EMPTY }
		const result = this.#input.slice(this.#position, index)
		this.#position += result.length
		return result
	}
}

/**
 * @param {ParsingInput|Array<ParsingInput>} parsingInput
 * @returns {InputString}
 */
export function inputToInputString(parsingInput) {
	/** @param {ParsingInput} input */
	function _inputToString(input) {
		if(input === undefined) { return undefined }

		if(input instanceof InputString) { return input.input }

		if((input instanceof ArrayBuffer) || ArrayBuffer.isView(input)) {
			const decoder = new TextDecoder(UTF_8, { fatal: true, ignoreBOM: false })
			return decoder.decode(input)
		}

		if(typeof input !== 'string') { throw new TypeError('unknown input type') }
		return input
	}

	if(Array.isArray(parsingInput)) {
		const result = parsingInput
			.map(_inputToString)
			.filter(s => s !== undefined)
		return new InputString(result.join(PARSING_INPUT_JOINER))
	}

	return new InputString(_inputToString(parsingInput))
}

/**
 * @see {@link https://www.rfc-editor.org/info/rfc9651}
 */
export class StructuredFieldParser {
	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-structured-fields}
	 *
	 * @param {ParsingInput|Array<ParsingInput>} input
	 * @param {FieldType} field_type
	 * @param {ParsingOptions} [options]
	 */
	static parse(input, field_type, options = {}) {
		// 1. Convert input_bytes into an ASCII string input_string; if conversion fails, fail parsing.
		const input_string = inputToInputString(input)

		// 2. Discard any leading SP characters from input_string.
		input_string.discardSP()

		const output =
			// 3. If field_type is "list", let output be the result of running Parsing a List (Section 4.2.1) with input_string.
			(field_type === SF_FIELD_TYPE_LIST) ? StructuredFieldParser.parseList(input_string, options) :

			// 4. If field_type is "dictionary", let output be the result of running Parsing a Dictionary (Section 4.2.2) with input_string.
			(field_type === SF_FIELD_TYPE_DICTIONARY) ? StructuredFieldParser.parseDictionary(input_string, options) :

			// 5. If field_type is "item", let output be the result of running Parsing an Item (Section 4.2.3) with input_string.
			(field_type === SF_FIELD_TYPE_ITEM) ? StructuredFieldParser.parseItem(input_string, options) :
			undefined

		// 6. Discard any leading SP characters from input_string.
		input_string.discardSP()

		// 7. If input_string is not empty, fail parsing.
		if(!input_string.isEmpty()) { throw new ParsingError(SF_ERROR.PARSER.NOT_EMPTY, input_string)}

		// 8. Otherwise, return output.
		return output
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.1}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-list}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseList(input_string, options = {}) {
		// 1. Let members be an empty array.
		const members = []

		// 2. While input_string is not empty:
		while(!input_string.isEmpty()) {

			// 	1. Append the result of running Parsing an Item or Inner List (Section 4.2.1.1) with input_string to members.
			members.push(StructuredFieldParser.parseItemOrInnerList(input_string, options))

			// 	2. Discard any leading OWS characters from input_string.
			input_string.discardOWS()

			// 	3. If input_string is empty, return members.
			if(input_string.isEmpty()) { return members }

			// 	4. Consume the first character of input_string; if it is not ",", fail parsing.
			const first = input_string.consume()
			if(first !== SF_COMMA) { throw new ParsingError(SF_ERROR.PARSER.MISSING_COMMA_IN_LIST, input_string) }

			// 	5. Discard any leading OWS characters from input_string.
			input_string.discardOWS()

			// 	6. If input_string is empty, there is a trailing comma; fail parsing.
			if(input_string.isEmpty()) { throw new ParsingError(SF_ERROR.PARSER.LIST_TRAILING_COMMA, input_string) }
		}

		// 3. No structured data has been found; return members (which is empty).
		return members
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.1.1}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-an-item-or-inner-li}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseItemOrInnerList(input_string, options = {}) {
		// 1. If the first character of input_string is "(", return the result of running Parsing an Inner List (Section 4.2.1.2) with input_string.
		if(input_string.peek() === SF_INNER_LIST_OPEN) { return StructuredFieldParser.parseInnerList(input_string, options) }

		// 2. Return the result of running Parsing an Item (Section 4.2.3) with input_string.
		return StructuredFieldParser.parseItem(input_string, options)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.1.2}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-an-inner-list}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseInnerList(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. Consume the first character of input_string; if it is not "(", fail parsing.
		const first = input_string.consume()
		if(first !== SF_INNER_LIST_OPEN) { throw new ParsingError(SF_ERROR.PARSER.INNER_LIST_EXPECTED_OPEN, input_string) }

		// 2. Let inner_list be an empty array.
		const inner_list = []

		// 3. While input_string is not empty:
		while(!input_string.isEmpty()) {

			// 	1. Discard any leading SP characters from input_string.
			input_string.discardSP()

			// 	2. If the first character of input_string is ")":
			const next = input_string.peek()
			if(next === SF_INNER_LIST_CLOSE) {
				// 		1. Consume the first character of input_string.
				input_string.consume()

				// 		2. Let parameters be the result of running Parsing Parameters (Section 4.2.3.2) with input_string.
				const parameters = StructuredFieldParser.parseParameters(input_string, options)

				// 		3. Return the tuple (inner_list, parameters).
				return formatter.formatInnerList(inner_list, parameters)
			}

			// 	3. Let item be the result of running Parsing an Item (Section 4.2.3) with input_string.
			const item = StructuredFieldParser.parseItem(input_string, options)

			// 	4. Append item to inner_list.
			inner_list.push(item)

			// 	5. If the first character of input_string is not SP or ")", fail parsing.
			const last = input_string.peek()
			if(last !== SF_SPACE && last !== SF_INNER_LIST_CLOSE) { throw new ParsingError(SF_ERROR.PARSER.INNER_LIST_EXPECTED_END, input_string) }
		}
		/* c8 ignore next 2 */
		// 4. The end of the Inner List was not found; fail parsing.
		throw new ParsingError(SF_ERROR.PARSER.INNER_LIST_END_NOT_FOUND, input_string)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.2}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-dictionary}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseDictionary(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. Let dictionary be an empty, ordered map.
		const dictionary = new Map()

		// 2. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. Let this_key be the result of running Parsing a Key (Section 4.2.3.3) with input_string.
			const key = StructuredFieldParser.parseKey(input_string, options)
			let member

			// 	2. If the first character of input_string is "=":
			const first = input_string.peek()
			if(first === SF_EQUALS) {
				// 		1. Consume the first character of input_string.
				input_string.consume()

				// 		2. Let member be the result of running Parsing an Item or Inner List (Section 4.2.1.1) with input_string.
				member = StructuredFieldParser.parseItemOrInnerList(input_string, options)
			}
			// 	3. Otherwise:
			else {
				// 		1. Let value be Boolean true.
				const value = true

				// 		2. Let parameters be the result of running Parsing Parameters (Section 4.2.3.2) with input_string.
				const parameters = StructuredFieldParser.parseParameters(input_string, options)

				// 		3. Let member be the tuple (value, parameters).
				member = formatter.formatDictionaryMember(value, parameters)
			}

			// 	4. If dictionary already contains a key this_key (comparing character for character), overwrite its value with member.
			// 	5. Otherwise, append key this_key with value member to dictionary.
			dictionary.set(key, member)

			// 	6. Discard any leading OWS characters from input_string.
			input_string.discardOWS()

			// 	7. If input_string is empty, return dictionary.
			if(input_string.isEmpty()) { return formatter.formatDictionary(dictionary) }

			// 	8. Consume the first character of input_string; if it is not ",", fail parsing.
			const next = input_string.consume()
			if(next !== SF_COMMA) { throw new ParsingError(SF_ERROR.PARSER.DICTIONARY_EXPECTED_COMMA, input_string) }

			// 	9. Discard any leading OWS characters from input_string.
			input_string.discardOWS()

			// 	10. If input_string is empty, there is a trailing comma; fail parsing.
			if(input_string.isEmpty()) { throw new ParsingError(SF_ERROR.PARSER.DICTIONARY_TRAILING_COMMA, input_string) }
		}

		// 3. No structured data has been found; return dictionary (which is empty).
		return formatter.formatDictionary(dictionary)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.3}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-an-item}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseItem(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. Let bare_item be the result of running Parsing a Bare Item (Section 4.2.3.1) with input_string.
		const bare_item = StructuredFieldParser.parseBareItem(input_string, options)

		// 2. Let parameters be the result of running Parsing Parameters (Section 4.2.3.2) with input_string.
		const parameters = StructuredFieldParser.parseParameters(input_string, options)

		// 3. Return the tuple (bare_item, parameters).
		return formatter.formatItem(bare_item, parameters)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.3.1}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-bare-item}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseBareItem(input_string, options = {}) {
		const first = input_string.peek()

		// 1. If the first character of input_string is a "-" or a DIGIT, return the result of running Parsing an Integer or Decimal (Section 4.2.4) with input_string.
		if(first === SF_DASH || isDigit(first)) { return StructuredFieldParser.parseIntegerOrDecimal(input_string, options) }

		// 2. If the first character of input_string is a DQUOTE, return the result of running Parsing a String (Section 4.2.5) with input_string.
		if(first === SF_DOUBLE_QUOTE) { return StructuredFieldParser.parseString(input_string, options) }

		// 3. If the first character of input_string is an ALPHA or "*", return the result of running Parsing a Token (Section 4.2.6) with input_string.
		if(first === SF_ASTERISK || isAlpha(first)) { return StructuredFieldParser.parseToken(input_string, options) }

		// 4. If the first character of input_string is ":", return the result of running Parsing a Byte Sequence (Section 4.2.7) with input_string.
		if(first === SF_COLON) { return StructuredFieldParser.parseByteSequence(input_string, options) }

		// 5. If the first character of input_string is "?", return the result of running Parsing a Boolean (Section 4.2.8) with input_string.
		if(first === SF_QUESTION_MARK) { return StructuredFieldParser.parseBoolean(input_string, options) }

		// 6. If the first character of input_string is "@", return the result of running Parsing a Date (Section 4.2.9) with input_string.
		if(first === SF_AMPERSAND) { return StructuredFieldParser.parseDate(input_string, options) }

		// 7. If the first character of input_string is "%", return the result of running Parsing a Display String (Section 4.2.10) with input_string.
		if(first === SF_PERCENT) { return StructuredFieldParser.parseDisplayString(input_string, options) }

		// 8. Otherwise, the item type is unrecognized; fail parsing.
		throw new ParsingError(SF_ERROR.PARSER.UNRECOGNIZED_TYPE, input_string)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.3.2}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-parameters}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseParameters(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. Let parameters be an empty, ordered map.
		const parameters = new Map()

		// 2. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. If the first character of input_string is not ";", exit the loop.
			const first = input_string.peek()
			if(first !== SF_SEMI_COLON) { break }

			// 	2. Consume the ";" character from the beginning of input_string.
			input_string.consume()

			// 	3. Discard any leading SP characters from input_string.
			input_string.discardSP()

			// 	4. Let param_key be the result of running Parsing a Key (Section 4.2.3.3) with input_string.
			const param_key = StructuredFieldParser.parseKey(input_string, options)

			// 	5. Let param_value be Boolean true.
			let param_value = true

			// 	6. If the first character of input_string is "=":
			const next = input_string.peek()
			if(next === SF_EQUALS) {
				// 		1. Consume the "=" character at the beginning of input_string.
				input_string.consume()

				// 		2. Let param_value be the result of running Parsing a Bare Item (Section 4.2.3.1) with input_string.
				param_value = StructuredFieldParser.parseBareItem(input_string, options)
			}

			//	7. If parameters already contains a key param_key (comparing character for character), overwrite its value with param_value.
			//	8. Otherwise, append key param_key with value param_value to parameters.
			parameters.set(param_key, param_value)
		}

		// 3. Return parameters.
		return formatter.formatParameters(parameters)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.3.3}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-key}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseKey(input_string, options) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. If the first character of input_string is not lcalpha or "*", fail parsing.
		const first = input_string.peek()
		if(!(first === SF_ASTERISK || isLCAlpha(first))) { throw new ParsingError(SF_ERROR.PARSER.KEY_INVALID_CHAR, input_string) }

		// 2. Let output_string be an empty string.
		let output_string = SF_EMPTY

		// 3. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. If the first character of input_string is not one of lcalpha, DIGIT, "_", "-", ".", or "*", return output_string.
			const next = input_string.peek()
			if(!(isLCAlpha(next) || isDigit(next) || next === SF_UNDERSCORE || next === SF_DASH || next === SF_PERIOD || next === SF_ASTERISK)) { return formatter.formatKey(output_string) }

			// 	2. Let char be the result of consuming the first character of input_string.
			const c = input_string.consume()

			// 	3. Append char to output_string.
			output_string += c
		}

		// 4. Return output_string.
		return formatter.formatKey(output_string)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.4}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-an-integer-or-decim}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseIntegerOrDecimal(input_string, options) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. Let type be "integer".
		/** @type {NumberType} */
		let type = SF_NUMBER_TYPE_INTEGER

		// 2. Let sign be 1.
		let sign = 1

		// 3. Let input_number be an empty string.
		let input_number = SF_EMPTY

		// 4. If the first character of input_string is "-", consume it and set sign to -1.
		const first = input_string.peek()
		if(first === SF_DASH) {
			input_string.consume()
			sign = -1
		}

		// 5. If input_string is empty, there is an empty integer; fail parsing.
		if(input_string.isEmpty()) { throw new ParsingError(SF_ERROR.PARSER.NUMBER_EMPTY, input_string) }

		// 6. If the first character of input_string is not a DIGIT, fail parsing.
		const second = input_string.peek()
		if(!isDigit(second)) { throw new ParsingError(SF_ERROR.PARSER.NUMBER_INVALID_DIGIT, input_string) }

		// 7. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. Let char be the result of consuming the first character of input_string.
			const c = input_string.consume()

			// 	2. If char is a DIGIT, append it to input_number.
			if(isDigit(c)) {
				input_number += c
			}
			// 	3. Else, if type is "integer" and char is ".":
			else if(type === SF_NUMBER_TYPE_INTEGER && c === SF_PERIOD) {
				// 		1. If input_number contains more than 12 characters, fail parsing.
				if(input_number.length > SF_MAX_INPUT_NUMBER_LENGTH) { throw new ParsingError(SF_ERROR.PARSER.NUMBER_MAX_LENGTH, input_string) }

				// 		2. Otherwise, append char to input_number and set type to "decimal".
				input_number += c
				type = SF_NUMBER_TYPE_DECIMAL
			}
			// 	4. Otherwise, prepend char to input_string, and exit the loop.
			else {
				input_string.unConsume()
				break
			}

			// 	5. If type is "integer" and input_number contains more than 15 characters, fail parsing.
			if(type === SF_NUMBER_TYPE_INTEGER && input_number.length > SF_MAX_INPUT_NUMBER_INTEGER_LENGTH) { throw new ParsingError(SF_ERROR.PARSER.INTEGER_MAX_LENGTH, input_string) }

			// 	6. If type is "decimal" and input_number contains more than 16 characters, fail parsing.
			if(type === SF_NUMBER_TYPE_DECIMAL && input_number.length > SF_MAX_INPUT_NUMBER_DECIMAL_LENGTH) { throw new ParsingError(SF_ERROR.PARSER.DECIMAL_MAX_LENGTH, input_string) }
		}

		let output_number

		// 8. If type is "integer":
		if(type === SF_NUMBER_TYPE_INTEGER) {
			// 	1. Let output_number be an Integer that is the result of parsing input_number as an integer.
			output_number = Number.parseInt(input_number, 10)
		}
		// 9. Otherwise:
		else {
			// 	1. If the final character of input_number is ".", fail parsing.
			const final = input_number.at(-1)
			if(final === SF_PERIOD) { throw new ParsingError(SF_ERROR.PARSER.NUMBER_ENDS_IN_DOT, input_string) }

			// 	2. If the number of characters after "." in input_number is greater than three, fail parsing.
			const periodIndex = input_number.indexOf(SF_PERIOD)
			const remainder = input_number.slice(periodIndex + 1)
			if(remainder.length > SF_MAX_DECIMAL_PLACE) { throw new ParsingError(SF_ERROR.PARSER.DECIMAL_MAX_DIGITS, input_string) }

			// 	3. Let output_number be a Decimal that is the result of parsing input_number as a decimal number.
			output_number = Number.parseFloat(input_number)
		}

		// 10. Let output_number be the product of output_number and sign.
		output_number *= sign

		// 11. Return output_number.
		if(output_number === 0) { output_number = 0 } // handle for -0

		return formatter.formatNumber(output_number, type)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.5}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-string}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseString(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. Let output_string be an empty string.
		let output_string = SF_EMPTY

		// 2. If the first character of input_string is not DQUOTE, fail parsing.
		const first = input_string.peek()
		if(first !== SF_DOUBLE_QUOTE) { throw new ParsingError(SF_ERROR.PARSER.STRING_INVALID_PREFIX, input_string) }

		// 3. Discard the first character of input_string.
		input_string.consume()

		// 4. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. Let char be the result of consuming the first character of input_string.
			const c = input_string.consume()

			// 	2. If char is a backslash ("\"):
			if(c === SF_BACK_SLASH) {
				// 		1. If input_string is now empty, fail parsing.
				if(input_string.isEmpty()) { throw new ParsingError(SF_ERROR.PARSER.STRING_ESCAPE_EMPTY, input_string) }

				// 		2. Let next_char be the result of consuming the first character of input_string.
				const next = input_string.consume()

				// 		3. If next_char is not DQUOTE or "\", fail parsing.
				if(!((next === SF_DOUBLE_QUOTE) || (next === SF_BACK_SLASH))) { throw new ParsingError(SF_ERROR.PARSER.STRING_INVALID_ESCAPE_CHAR, input_string) }

				// 		4. Append next_char to output_string.
				output_string += next
			}
			// 	3. Else, if char is DQUOTE, return output_string.
			else if (c === SF_DOUBLE_QUOTE) {
				return formatter.formatString(output_string)
			}
			// 	4. Else, if char is in the range %x00-1f or %x7f-ff (i.e., it is not in VCHAR or SP), fail parsing.
			// biome-ignore lint/style/noNegationElse: follow spec
			else if(!(isVChar(c) || isSP(c))) {
				throw new ParsingError(SF_ERROR.PARSER.STRING_INVALID_CHAR, input_string)
			}
			// 	5. Else, append char to output_string.
			else {
				output_string += c
			}
		}

		// 5. Reached the end of input_string without finding a closing DQUOTE; fail parsing.
		throw new ParsingError(SF_ERROR.PARSER.STRING_MISSING_DOUBLE_QUOTE, input_string)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.6}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-token}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseToken(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. If the first character of input_string is not ALPHA or "*", fail parsing.
		const first = input_string.peek()
		if(!(isAlpha(first) || first === SF_ASTERISK)) { throw new ParsingError(SF_ERROR.PARSER.TOKEN_INVALID_CHAR, input_string) }

		// 2. Let output_string be an empty string.
		let output_string = SF_EMPTY

		// 3. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. If the first character of input_string is not in tchar, ":", or "/", return output_string.
			const next = input_string.peek()
			if(!(isTChar(next) || next === SF_COLON || next === SF_FORWARD_SLASH)) { return formatter.formatToken(output_string) }

			// 	2. Let char be the result of consuming the first character of input_string.
			const c = input_string.consume()

			// 	3. Append char to output_string.
			output_string += c
		}

		// 4. Return output_string.
		return formatter.formatToken(output_string)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.7}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-boolean}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseByteSequence(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. If the first character of input_string is not ":", fail parsing.
		const first = input_string.peek()
		if(first !== SF_COLON) { throw new ParsingError(SF_ERROR.PARSER.BYTE_SEQ_INVALID_PREFIX, input_string) }

		// 2. Discard the first character of input_string.
		input_string.consume()

		// 3. If there is not a ":" character before the end of input_string, fail parsing.
		const indexOfColon = input_string.indexOf(SF_COLON)
		if(indexOfColon === -1) { throw new ParsingError(SF_ERROR.PARSER.BYTE_SEQ_MISSING_END_COLON, input_string) }

		// 4. Let b64_content be the result of consuming content of input_string up to but not including the first instance of the character ":".
		const b64_content = input_string.consumeUntil(indexOfColon)

		// 5. Consume the ":" character at the beginning of input_string.
		input_string.consume()

		// 6. If b64_content contains a character not included in ALPHA, DIGIT, "+", "/", and "=", fail parsing.
		if(!isBase64Alphabet(b64_content)) { throw new ParsingError(SF_ERROR.PARSER.BYTE_SEQ_INVALID_CHAR, input_string) }

		// 7. Let binary_content be the result of base64-decoding [RFC4648] b64_content, synthesizing padding if necessary (note the requirements about recipient behavior below). If base64 decoding fails, parsing fails.
		// 8. Return binary_content.
		try {
			const binary_content = Uint8Array.fromBase64(b64_content, { alphabet: BINARY_ALPHABET, lastChunkHandling: options?.lastChunkHandling ?? 'strict' })
			return formatter.formatBinary(binary_content)
		}
		catch(err) {
			// biome-ignore lint/style/useErrorCause: false positive
			throw new ParsingError(SF_ERROR.PARSER.BYTE_SEQ_INVALID_ENCODING, input_string, { cause: err })
		}
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.8}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-boolean}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseBoolean(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. If the first character of input_string is not "?", fail parsing.
		const first = input_string.peek()
		if(first !== SF_QUESTION_MARK) { throw new ParsingError(SF_ERROR.PARSER.BOOLEAN_INVALID_CHAR, input_string) }

		// 2. Discard the first character of input_string.
		input_string.consume()

		const next = input_string.peek()

		// 3. If the first character of input_string matches "1", discard the first character, and return true.
		if(next === SF_BOOLEAN_ONE) {
			input_string.consume()
			return formatter.formatBoolean(true)
		}

		// 4. If the first character of input_string matches "0", discard the first character, and return false.
		if(next === SF_BOOLEAN_ZERO) {
			input_string.consume()
			return formatter.formatBoolean(false)
		}

		// 5. No value has matched; fail parsing.
		throw new ParsingError(SF_ERROR.PARSER.BOOLEAN_INVALID_VALUE, input_string)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.9}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-date}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseDate(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. If the first character of input_string is not "@", fail parsing.
		const first = input_string.peek()
		if(first !== SF_AMPERSAND) { throw new ParsingError(SF_ERROR.PARSER.DATE_INVALID_PREFIX, input_string) }

		// 2. Discard the first character of input_string.
		input_string.consume()

		// 3. Let output_date be the result of running Parsing an Integer or Decimal (Section 4.2.4) with input_string.
		const output_date = StructuredFieldParser.parseIntegerOrDecimal(input_string, options)

		// 4. If output_date is a Decimal, fail parsing.
		if(isDecimal(output_date)) { throw new ParsingError(SF_ERROR.PARSER.DATE_IS_DECIMAL, input_string) }

		// 5. Return output_date.
		return formatter.formatDate(output_date)
	}

	/**
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#section-4.2.10}
	 * @see {@link https://www.rfc-editor.org/info/rfc9651/#name-parsing-a-display-string}
	 *
	 * @param {InputString} input_string
	 * @param {ParsingOptions} [options]
	 */
	static parseDisplayString(input_string, options = {}) {
		const formatter = options?.format ?? SF_DEFAULT_FORMATTER

		// 1. If the first two characters of input_string are not "%" followed by DQUOTE, fail parsing.
		// 2. Discard the first two characters of input_string.
		const first = input_string.peek()
		if(first !== SF_PERCENT) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_INVALID_PREFIX, input_string) }
		input_string.consume()

		const second = input_string.peek()
		if(second !== SF_DOUBLE_QUOTE) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_INVALID_QUOTE_PREFIX, input_string) }
		input_string.consume()

		// 3. Let byte_array be an empty byte array.
		const byte_array = []

		// 4. While input_string is not empty:
		while(!input_string.isEmpty()) {
			// 	1. Let char be the result of consuming the first character of input_string.
			const c = input_string.consume()

			// 	2. If char is in the range %x00-1f or %x7f-ff (i.e., it is not in VCHAR or SP), fail parsing.
			if(!(isVChar(c) || isSP(c))) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_INVALID_CHAR, input_string) }

			// 	3. If char is "%":
			if(c === SF_PERCENT) {
				// 		1. Let octet_hex be the result of consuming two characters from input_string. If there are not two characters, fail parsing.
				const octet_hex1 = input_string.consume()
				const octet_hex2 = input_string.consume()
				if(octet_hex1 === undefined || octet_hex2 === undefined) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_MISSING_HEX, input_string) }

				// 		2. If octet_hex contains characters outside the range %x30-39 or %x61-66 (i.e., it is not in 0-9 or lowercase a-f), fail parsing.
				if(!isLowercaseHex(octet_hex1)) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_NOT_LOWERCASE, input_string) }
				if(!isLowercaseHex(octet_hex2)) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_NOT_LOWERCASE, input_string) }

				// 		3. Let octet be the result of hex decoding octet_hex (Section 8 of [RFC4648]).
				const octet = Number.parseInt(`${octet_hex1}${octet_hex2}`, BASE_16)
				if(Number.isNaN(octet)) { throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_INVALID_HEX, input_string) }

				// 		4. Append octet to byte_array.
				byte_array.push(octet)
			}
			// 	4. If char is DQUOTE:
			else if(c === SF_DOUBLE_QUOTE) {
				// 		1. Let unicode_sequence be the result of decoding byte_array as a UTF-8 string (Section 3 of [UTF8]). Fail parsing if decoding fails.
				// 		2. Return unicode_sequence.
				try {
					const decoder = new TextDecoder(UTF_8, { fatal: true, ignoreBOM: false })
					const unicode_sequence = decoder.decode(Uint8Array.from(byte_array))
					return formatter.formatDisplayString(unicode_sequence)
				}
				catch(err) {
					// biome-ignore lint/style/useErrorCause: false positive
					throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_FAILED_DECODE, input_string, { cause: err })
				}
			}
			// 	5. Otherwise, if char is not "%" or DQUOTE:
			else {
				// 		1. Let byte be the result of applying ASCII encoding to char.
				// 		2. Append byte to byte_array.
				byte_array.push(c?.charCodeAt(0))
			}
		}

		// 5. Reached the end of input_string without finding a closing DQUOTE; fail parsing.
		throw new ParsingError(SF_ERROR.PARSER.DISPLAY_STRING_MISSING_QUOTE, input_string)
	}
}
