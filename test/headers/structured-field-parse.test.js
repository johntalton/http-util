import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
	StructuredFieldParser,
	InputString,
	NativeFormatter,
	HTTPWGTestFormatter,
	inputToInputString,
	isLowercaseHex,
	isOWS,
	isBase64Alphabet
} from '@johntalton/http-util/structured-field'

const options = {
	format: NativeFormatter
}

describe('StructuredFieldParser', () => {
	describe('parse', () => {
		it('should handle undefined list', () => {
			const result = StructuredFieldParser.parse(undefined, 'list', options)
			assert.deepEqual(result, [])
		})

		it('should handle empty string list', () => {
			const result = StructuredFieldParser.parse('', 'list', options)
			assert.deepEqual(result, [])
		})

		it('should handle undefined dictionary', () => {
			const result = StructuredFieldParser.parse(undefined, 'dictionary', options)
			assert.deepEqual(result, new Map())
		})

		it('should handle empty string dictionary', () => {
			const result = StructuredFieldParser.parse('', 'dictionary', options)
			assert.deepEqual(result, new Map())
		})

		it('should handle input type of InputString', () => {
			const input_string = new InputString('?1')
			const result = StructuredFieldParser.parse(input_string, 'item', options)
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle input Array', () => {
			const result = StructuredFieldParser.parse(['a', 'b'], 'list', options)
			assert.deepEqual(result, [
				{ bare_item: Symbol.for('a'), parameters: new Map() },
				{ bare_item: Symbol.for('b'), parameters: new Map() },
			])
		})

		it('should handle input Array of mixed type', () => {
			const encoder = new TextEncoder()
			const buffer = encoder.encode('?1')
			const result = StructuredFieldParser.parse(['a', buffer], 'list', options)
			assert.deepEqual(result, [
				{ bare_item: Symbol.for('a'), parameters: new Map() },
				{ bare_item: true, parameters: new Map() },
			])
		})

		it('should handle input type of InputString (with offset)', () => {
			const input_string = new InputString('XXX?1', 3)
			const result = StructuredFieldParser.parse(input_string, 'item', options)
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle input type of Uint8Array', () => {
			const encoder = new TextEncoder()
			const buffer = encoder.encode('?1')
			const result = StructuredFieldParser.parse(buffer, 'item', options)
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle input type of ArrayBuffer', () => {
			const encoder = new TextEncoder()
			const buffer = encoder.encode('?1')
			const result = StructuredFieldParser.parse(buffer.buffer, 'item', options)
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should throw on undefined item', () => {
			assert.throws(() => StructuredFieldParser.parse(undefined, 'item'), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should throw on empty item', () => {
			assert.throws(() => StructuredFieldParser.parse('', 'item'), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should handle unknown field type', () => {
			const result = StructuredFieldParser.parse('', 'FAKE', options)
			assert.equal(result, undefined)
		})

		it('should throw extra content after item', () => {
			assert.throws(() => StructuredFieldParser.parse('42 x', 'item'), {
				name: 'ParsingError',
				message: 'trailing input not empty @ position: 3'
			})
		})

		it('should throw on dangling comma', () => {
			assert.throws(() => StructuredFieldParser.parse(',', 'list'), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should handle empty inner list', () => {
			const result = StructuredFieldParser.parse('()', 'list', options)
			assert.deepEqual(result, [{ inner_list: [], parameters: new Map() }])
		})

		it('should throw list not a comma', () => {
			assert.throws(() => StructuredFieldParser.parse('a? ', 'list'), {
				name: 'ParsingError',
				message: 'list expected comma @ position: 2'
			})
		})

		it('should throw on dangling comma after inner-list', () => {
			assert.throws(() => StructuredFieldParser.parse('(),', 'list'), {
				name: 'ParsingError',
				message: 'list trailing comma @ position: 3'
			})
		})

		it('should throw on dangling comma after item', () => {
			assert.throws(() => StructuredFieldParser.parse('foo,', 'list'), {
				name: 'ParsingError',
				message: 'list trailing comma @ position: 4'
			})
		})

		it('should handle simple dictionary', () => {
			const result = StructuredFieldParser.parse('a', 'dictionary', options)
			assert.deepEqual(result, new Map([['a', { parameters: new Map(), value: true }]]))
		})

		it('should handle simple dictionary with parameters', () => {
			const result = StructuredFieldParser.parse('a;b=c', 'dictionary', options)
			assert.deepEqual(result, new Map([['a', { value: true, parameters: new Map([['b', Symbol.for('c')]]) }]]))
		})

		it('should handle quotes string', () => {
			const result = StructuredFieldParser.parse('"test"', 'item', options)
			assert.deepEqual(result, { bare_item: 'test', parameters: new Map() })
		})

		it('should handle integer item', () => {
			const result = StructuredFieldParser.parse('42', 'item', options)
			assert.deepEqual(result, { bare_item: 42, parameters: new Map() })
		})

		it('should handle decimal item', () => {
			const result = StructuredFieldParser.parse('3.141', 'item', options)
			assert.deepEqual(result, { bare_item: 3.141, parameters: new Map() })
		})

		it('should throw on more then 3 digit decimal', () => {
			assert.throws(() => StructuredFieldParser.parse('3.1415', 'item'), {
				name: 'ParsingError',
				message: 'decimal only allows max 3 digits @ position: 6'
			})
		})

		it('should throw on signed empty number', () => {
			assert.throws(() => StructuredFieldParser.parse('-', 'item'), {
				name: 'ParsingError',
				message: 'integer or decimal empty @ position: 1'
			})
		})

		it('should throw on max integer length', () => {
			assert.throws(() => StructuredFieldParser.parse('1234567890123450', 'item'), {
				name: 'ParsingError',
				message: 'integer max length @ position: 16'
			})
		})

		it('should throw on max integer length (last period)', () => {
			assert.throws(() => StructuredFieldParser.parse('123456789012345.', 'item'), {
				name: 'ParsingError',
				message: 'integer or decimal max length @ position: 16'
			})
		})

		it('should throw on max decimal length', () => {
			assert.throws(() => StructuredFieldParser.parse('123456789.1234560', 'item'), {
				name: 'ParsingError',
				message: 'decimal max length @ position: 17'
			})
		})

		it('should throw trailing decimal period', () => {
			assert.throws(() => StructuredFieldParser.parse('42.', 'item'), {
				name: 'ParsingError',
				message: 'decimal can not end in period @ position: 3'
			})
		})

		it('should handle boolean true item', () => {
			const result = StructuredFieldParser.parse('?1', 'item', options)
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle boolean false item', () => {
			const result = StructuredFieldParser.parse('?0', 'item', options)
			assert.deepEqual(result, { bare_item: false, parameters: new Map() })
		})

		it('should throw invalid boolean', () => {
			assert.throws(() => StructuredFieldParser.parse('?-0', 'item'), {
				name: 'ParsingError',
				message: 'invalid boolean value @ position: 1'
			})
		})

		it('should handle Date item', () => {
			const result = StructuredFieldParser.parse('@1659578233', 'item', options)
			const date = Temporal.Instant.fromEpochMilliseconds(1659578233 * 1000)
			assert.deepEqual(result, { bare_item: date, parameters: new Map() })
			assert.equal(date.toJSON(), '2022-08-04T01:57:13Z')
		})

		it('should handle byte sequence item', () => {
			const str = 'pretend this is binary content.'
			const encoder = new TextEncoder()
			const encodedStr = encoder.encode(str)
			const result = StructuredFieldParser.parse(':cHJldGVuZCB0aGlzIGlzIGJpbmFyeSBjb250ZW50Lg==:', 'item', options)
			assert.deepEqual(result, { bare_item: encodedStr, parameters: new Map() })
		})

		it('should handle empty byte sequence item', () => {
			const result = StructuredFieldParser.parse('::', 'item', options)
			assert.deepEqual(result, { bare_item: Uint8Array.from([]), parameters: new Map() })
		})

		it('should throw on byte sequence with whitespace item', () => {
			assert.throws(() => StructuredFieldParser.parse(':     :', 'item'), {
				name: 'ParsingError',
				message: 'byte sequence invalid char @ position: 7'
			})
		})

		it('should handle byte sequence item (bad padding loose mode)', () => {
			const result = StructuredFieldParser.parse(':aGVsbG8:', 'item', { ...options, lastChunkHandling: 'loose' })
			assert.deepEqual(result, { bare_item: Uint8Array.from([104, 101, 108, 108, 111]), parameters: new Map() })
		})

		it('should throw on byte sequence (bad padding strict mode))', () => {
			assert.throws(() => StructuredFieldParser.parse(':aGVsbG8:', 'item', { ...options, lastChunkHandling: 'strict' }), {
				name: 'ParsingError',
				message: 'byte sequence invalid encoding @ position: 9',
				// cause: new SyntaxError('')
			})
		})

		// it('should throw on byte sequence as base64url)', () => {
		// 	assert.throws(() => StructuredFieldParser.parse(':_-Ah:', 'item'), {
		// 		name: 'ParsingError',
		// 		message: 'byte sequence invalid encoding @ position: 6',
		// 		cause: new SyntaxError('Found a character that cannot be part of a valid base64 string.')
		// 	})
		// })

		it('should handle display-string item (emoji)', () => {
			const result = StructuredFieldParser.parse('%"%f0%9f%91%a9%f0%9f%8f%bb%e2%80%8d%e2%9d%a4%ef%b8%8f%e2%80%8d%f0%9f%92%8b%e2%80%8d%f0%9f%91%a9%f0%9f%8f%bc"', 'item', options)
			assert.deepEqual(result, { bare_item: '👩🏻‍❤️‍💋‍👩🏼', parameters: new Map() })
		})

		it('should handle display-string item (text)', () => {
			const result = StructuredFieldParser.parse('%"This is intended for display to %c3%bcsers."', 'item', options)
			assert.deepEqual(result, { bare_item: 'This is intended for display to üsers.', parameters: new Map() })
		})

		it('should handle display-string item (encoded)', () => {
			const result = StructuredFieldParser.parse(`%"${encodeURIComponent('TEST 1 2 3')}"`, 'item', options)
			assert.deepEqual(result, { bare_item: 'TEST 1 2 3', parameters: new Map() })
		})

		it('should throw display-string parse failure', () => {
			assert.throws(() => StructuredFieldParser.parse('%\"%c3%28\"', 'item'), {
				name: 'ParsingError',
				message: 'display string decoding error @ position: 9',
				// cause: new TypeError('The encoded data was not valid for encoding utf-8')
			})
		})

		it('should throw display-string parse failure (missing end quote)', () => {
			assert.throws(() => StructuredFieldParser.parse('%\"TEST', 'item'), {
				name: 'ParsingError',
				message: 'display string missing close quote @ position: 6'
			})
		})

		it('should handle display-string with inner BOM', () => {
			const result = StructuredFieldParser.parse('%\"BOM: %ef%bb%bf\"', 'item', options)
			assert.deepEqual(result, { bare_item: 'BOM: \uFEFF', parameters: new Map() })
		})

		it('should handle display-string with starting encoded BOM', () => {
			const result = StructuredFieldParser.parse('%\"%ef%bb%bfBOM\"', 'item', options)
			assert.deepEqual(result, { bare_item: 'BOM', parameters: new Map() })
		})

		it('should handle display-string with starting BOM', () => {
			assert.throws(() => StructuredFieldParser.parse('%\"\uFEFFBOM\"', 'item'), {
				name: 'ParsingError',
				message: 'display string invalid char @ position: 3'
			})
		})

		it('should throw on BOM at start of input', () => {
			const encoder = new TextEncoder()
			const encoded = encoder.encode('\uFEFF%\"WITH BOM\"')
			const result = StructuredFieldParser.parse(encoded, 'item', options)
			assert.deepEqual(result, { bare_item: 'WITH BOM', parameters: new Map() })
		})

		it('should handle string item with escape quote', () => {
			const result = StructuredFieldParser.parse(`"A \\"TEST\\" STRING"`, 'item', options)
			assert.deepEqual(result, { bare_item: 'A "TEST" STRING', parameters: new Map() })
		})

		it('should throw trailing string backslash', () => {
			assert.throws(() => StructuredFieldParser.parse('"TEST\\', 'item'), {
				name: 'ParsingError',
				message: 'string invalid escape at end of input @ position: 6'
			})
		})

		it('should throw string unknown escape', () => {
			assert.throws(() => StructuredFieldParser.parse('"TEST\\?"', 'item'), {
				name: 'ParsingError',
				message: 'string invalid escape char @ position: 7'
			})
		})

		it('should throw string invalid char', () => {
			assert.throws(() => StructuredFieldParser.parse('"HERE\tTHERE"', 'item'), {
				name: 'ParsingError',
				message: 'string invalid char @ position: 6'
			})
		})

		it('should throw string on missing close quote', () => {
			assert.throws(() => StructuredFieldParser.parse('"TEST', 'item'), {
				name: 'ParsingError',
				message: 'string expected closing quote @ position: 5'
			})
		})

		it('should handle dictionary with value', () => {
			const result = StructuredFieldParser.parse('a=1', 'dictionary', options)
			assert.deepEqual(result, new Map([
				['a', { bare_item: 1, parameters: new Map() }]
			]))
		})

		it('should handle dictionary with value (multiple)', () => {
			const result = StructuredFieldParser.parse('a=1, b=2', 'dictionary', options)
			assert.deepEqual(result, new Map([
				['a', { bare_item: 1, parameters: new Map() }],
				['b', { bare_item: 2, parameters: new Map() }]
			]))
		})

		it('should handle simple inner list', () => {
			const result = StructuredFieldParser.parse('(one two)', 'list', options)
			assert.deepEqual(result, [{
				inner_list: [
					{ bare_item: Symbol.for('one'), parameters: new Map() },
					{ bare_item: Symbol.for('two'), parameters: new Map() },
				], parameters: new Map()
			}])
		})

		it('should throw inner list missing close', () => {
			assert.throws(() => StructuredFieldParser.parse('(a b c', 'list'), {
				name: 'ParsingError',
				message: 'inner-list expected sp or close parentheses @ position: 6'
			})
		})

		it('should throw date when decimal', () => {
			assert.throws(() => StructuredFieldParser.parse('@3.14', 'list'), {
				name: 'ParsingError',
				message: 'date can not be decimal @ position: 5'
			})
		})

		it('should throw display string zero byte escape', () => {
			assert.throws(() => StructuredFieldParser.parse('%"%', 'list'), {
				name: 'ParsingError',
				message: 'display string missing hex value @ position: 3'
			})
		})

		it('should throw display string single byte escape', () => {
			assert.throws(() => StructuredFieldParser.parse('%"%x', 'list'), {
				name: 'ParsingError',
				message: 'display string missing hex value @ position: 4'
			})
		})

		it('should throw display escape not lowercase (first)', () => {
			assert.throws(() => StructuredFieldParser.parse('%"%Ff"', 'list'), {
				name: 'ParsingError',
				message: 'display string escape not lowercase or digit @ position: 5'
			})
		})

		it('should throw display escape not lowercase (second)', () => {
			assert.throws(() => StructuredFieldParser.parse('%"%fF"', 'list'), {
				name: 'ParsingError',
				message: 'display string escape not lowercase or digit @ position: 5'
			})
		})

		it('should throw display string missing start quote', () => {
			assert.throws(() => StructuredFieldParser.parse('%bad', 'list'), {
				name: 'ParsingError',
				message: 'display string invalid prefix quote @ position: 1'
			})
		})

		it('should handle custom formatter (binary item)', () => {
			const format = HTTPWGTestFormatter
			const result = StructuredFieldParser.parse(':cHJldGVuZCB0aGlzIGlzIGJpbmFyeSBjb250ZW50Lg==:', 'item', { format })
			assert.deepEqual(result, [{ "__type": "binary", "value": "OBZGK5DFNZSCA5DINFZSA2LTEBRGS3TBOJ4SAY3PNZ2GK3TUFY======" }, []])
		})

		it('should handle custom formatter (date item)', () => {
			const format = HTTPWGTestFormatter
			const result = StructuredFieldParser.parse('@1234', 'item', { format })
			assert.deepEqual(result, [ { __type: 'date', value: 1234 }, [] ])
		})


		it('should handle custom formatter (dictionary)', () => {
			const format = HTTPWGTestFormatter
			const result = StructuredFieldParser.parse('a=(1 2), b=3, c=4;aa=bb, d=(5 6);valid', 'dictionary', { format })
			assert.deepEqual(result, [
				["a", [[
					[1, []],
					[2, []]
				], []]],
				["b", [3, []]],
				["c", [4, [["aa", { "__type": "token", "value": "bb" }]]]],
				["d", [[
					[5, []],
					[6, []]
				], [["valid", true]]]]
			])
		})

	})

	describe('parseList', () => {
		it('should handle undefined', () => {
			const inputString = new InputString(undefined)
			const result = StructuredFieldParser.parseList(inputString)
			assert.deepEqual(result, [])
		})
	})

	describe('parseDictionary', () => {
		it('should handle undefined', () => {
			const inputString = new InputString(undefined)
			const result = StructuredFieldParser.parseDictionary(inputString)
			assert.deepEqual(result, new Map())
		})
	})

	describe('parseItem', () => {
		it('should throw on undefined', () => {
			const inputString = new InputString(undefined)
			assert.throws(() => StructuredFieldParser.parseItem(inputString), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should throw on bad digit', () => {
			const inputString = new InputString('-A')
			assert.throws(() => StructuredFieldParser.parseItem(inputString), {
				name: 'ParsingError',
				message: 'integer or decimal not a digit @ position: 1'
			})
		})

		it('should handle negative-zero', () => {
			const inputString = new InputString('-0')
			const result = StructuredFieldParser.parseItem(inputString)
			assert.deepEqual(result, { bare_item: 0, parameters: new Map() })
		})

		it('should throw missing binary close colon', () => {
			const inputString = new InputString(':abcdef')
			assert.throws(() => StructuredFieldParser.parseItem(inputString), {
				name: 'ParsingError',
				message: 'byte sequence missing colon @ position: 1'
			})
		})
	})

	describe('parseDisplayString', () => {
		it('should throw if first char not percent', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseDisplayString(inputString), {
				name: 'ParsingError',
				message: 'display string invalid prefix @ position: 0'
			})
		})
	})

	describe('parseDate', () => {
		it('should throw if first char not ampersand', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseDate(inputString), {
				name: 'ParsingError',
				message: 'date invalid prefix @ position: 0'
			})
		})
	})

	describe('parseBoolean', () => {
		it('should throw if first char not question mark', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseBoolean(inputString), {
				name: 'ParsingError',
				message: 'boolean invalid prefix @ position: 0'
			})
		})
	})

	describe('parseByteSequence', () => {
		it('should throw if first char not colon', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseByteSequence(inputString), {
				name: 'ParsingError',
				message: 'byte sequence invalid prefix @ position: 0'
			})
		})
	})

	describe('parseToken', () => {
		it('should throw if first char not alpha/asterisk', () => {
			const inputString = new InputString('!')
			assert.throws(() => StructuredFieldParser.parseToken(inputString), {
				name: 'ParsingError',
				message: 'token invalid char @ position: 0'
			})
		})
	})

	describe('parseString', () => {
		it('should throw if first char not double quote', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseString(inputString), {
				name: 'ParsingError',
				message: 'string invalid prefix @ position: 0'
			})
		})
	})

	describe('parseKey', () => {
		it('should throw if first char not lower char or asterisk', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseKey(inputString), {
				name: 'ParsingError',
				message: 'key invalid char @ position: 0'
			})
		})
	})

	describe('parseInnerList', () => {
		it('should throw if first char not open parenthesis', () => {
			const inputString = new InputString('X')
			assert.throws(() => StructuredFieldParser.parseInnerList(inputString), {
				name: 'ParsingError',
				message: 'inner-list expected open parentheses @ position: 1'
			})
		})
	})

	describe('inputToInputString', () => {
		it('should throw on invalid input type', () => {
			assert.throws(() => inputToInputString(42), {
				name: 'TypeError',
				message: 'unknown input type'
			})
		})
	})

	describe('InputString', () => {
		describe('peek', () => {
			// it('', () => {

			// })
		})

		describe('consume', () => {
			it('should return undefined on undefined', () => {
				const inputString = new InputString(undefined)
				const result = inputString.consume()
				assert.equal(result, undefined)
			})
		})

		describe('unConsume', () => {
			// it('', () => {

			// })
		})

		describe('discardSP', () => {
			// it('', () => {

			// })
		})

		describe('discardOWS', () => {
			// it('', () => {

			// })
		})

		describe('isEmpty', () => {
			// it('', () => {

			// })
		})

		describe('indexOf', () => {
			it('should return negative on undefined', () => {
				const inputString = new InputString(undefined)
				const result = inputString.indexOf(':)')
				assert.equal(result, -1)
			})
		})

		describe('consumeUntil', () => {
			it('should return empty on undefined', () => {
				const inputString = new InputString(undefined)
				const result = inputString.consumeUntil(42)
				assert.equal(result, '')
			})
		})
	})


	describe('isOWS', () => {
		it('should handle undefined', () => {
			const result = isOWS(undefined)
			assert.equal(result, false)
		})

		it('should handle space', () => {
			const result = isOWS(' ')
			assert.equal(result, true)
		})

		it('should handle tap', () => {
			const result = isOWS('\t')
			assert.equal(result, true)
		})


	})

	describe('isLowercaseHex', () => {
		it('should handle undefined', () => {
			const result = isLowercaseHex(undefined)
			assert.equal(result, false)
		})


	})

	describe('isBase64Alphabet', () => {
		it('should handle undefined', () => {
			const result = isBase64Alphabet(undefined)
			assert.equal(result, false)
		})


	})


})
