import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { StructuredField, InputString } from '@johntalton/http-util/util'

describe('StructuredFiled', () => {
	describe('parse', () => {
		it('should handle undefined list', () => {
			const result = StructuredField.parse(undefined, 'list')
			assert.deepEqual(result, [])
		})

		it('should handle empty string list', () => {
			const result = StructuredField.parse('', 'list')
			assert.deepEqual(result, [])
		})

		it('should handle undefined dictionary', () => {
			const result = StructuredField.parse(undefined, 'dictionary')
			assert.deepEqual(result, new Map())
		})

		it('should handle empty string dictionary', () => {
			const result = StructuredField.parse('', 'dictionary')
			assert.deepEqual(result, new Map())
		})

		it('should handle input type of InputString', () => {
			const input_string = new InputString('?1')
			const result = StructuredField.parse(input_string, 'item')
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle input type of InputString (with offset)', () => {
			const input_string = new InputString('XXX?1', 3)
			const result = StructuredField.parse(input_string, 'item')
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle input type of Uint8Array', () => {
			const encoder = new TextEncoder()
			const buffer = encoder.encode('?1')
			const result = StructuredField.parse(buffer, 'item')
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle input type of ArrayBuffer', () => {
			const encoder = new TextEncoder()
			const buffer = encoder.encode('?1')
			const result = StructuredField.parse(buffer.buffer, 'item')
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should throw on undefined item', () => {
			assert.throws(() => StructuredField.parse(undefined, 'item'), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should throw on empty item', () => {
			assert.throws(() => StructuredField.parse('', 'item'), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should handle unknown field type', () => {
			const result = StructuredField.parse('', 'FAKE')
			assert.equal(result, undefined)
		})

		it('should throw on dangling comma', () => {
			assert.throws(() => StructuredField.parse(',', 'list'), {
				name: 'ParsingError',
				message: 'item type unrecognized @ position: 0'
			})
		})

		it('should handle empty inner list', () => {
			const result = StructuredField.parse('()', 'list')
			assert.deepEqual(result, [{ inner_list: [], parameters: new Map() }])
		})

		it('should throw on dangling comma after inner-list', () => {
			assert.throws(() => StructuredField.parse('(),', 'list'), {
				name: 'ParsingError',
				message: 'list trailing comma @ position: 3'
			})
		})

		it('should throw on dangling comma after item', () => {
			assert.throws(() => StructuredField.parse('foo,', 'list'), {
				name: 'ParsingError',
				message: 'list trailing comma @ position: 4'
			})
		})

		it('should handle simple dictionary', () => {
			const result = StructuredField.parse('a', 'dictionary')
			assert.deepEqual(result, new Map([['a', { parameters: new Map(), value: true }]]))
		})

		it('should handle simple dictionary with parameters', () => {
			const result = StructuredField.parse('a;b=c', 'dictionary')
			assert.deepEqual(result, new Map([['a', { value: true, parameters: new Map([['b', 'c']]) }]]))
		})

		it('should handle quotes string', () => {
			const result = StructuredField.parse('"test"', 'item')
			assert.deepEqual(result, { bare_item: 'test', parameters: new Map() })
		})

		it('should handle integer item', () => {
			const result = StructuredField.parse('42', 'item')
			assert.deepEqual(result, { bare_item: 42, parameters: new Map() })
		})

		it('should handle decimal item', () => {
			const result = StructuredField.parse('3.141', 'item')
			assert.deepEqual(result, { bare_item: 3.141, parameters: new Map() })
		})

		it('should throw on more then 3 digit decimal', () => {
			assert.throws(() => StructuredField.parse('3.1415', 'item'), {
				name: 'ParsingError',
				message: 'decimal only allows max 3 digits @ position: 6'
			})
		})

		it('should throw on signed empty number', () => {
			assert.throws(() => StructuredField.parse('-', 'item'), {
				name: 'ParsingError',
				message: 'integer or decimal empty @ position: 1'
			})
		})

		it('should throw on max integer length', () => {
			assert.throws(() => StructuredField.parse('1234567890123450', 'item'), {
				name: 'ParsingError',
				message: 'integer max length @ position: 16'
			})
		})

		it('should throw on max integer length (last period)', () => {
			assert.throws(() => StructuredField.parse('123456789012345.', 'item'), {
				name: 'ParsingError',
				message: 'integer or decimal max length @ position: 16'
			})
		})

		it('should throw on max decimal length', () => {
			assert.throws(() => StructuredField.parse('123456789.1234560', 'item'), {
				name: 'ParsingError',
				message: 'decimal max length @ position: 17'
			})
		})

		it('should throw trailing decimal period', () => {
			assert.throws(() => StructuredField.parse('42.', 'item'), {
				name: 'ParsingError',
				message: 'decimal can not end in period @ position: 3'
			})
		})

		it('should handle boolean true item', () => {
			const result = StructuredField.parse('?1', 'item')
			assert.deepEqual(result, { bare_item: true, parameters: new Map() })
		})

		it('should handle boolean false item', () => {
			const result = StructuredField.parse('?0', 'item')
			assert.deepEqual(result, { bare_item: false, parameters: new Map() })
		})

		it('should throw invalid boolean', () => {
			assert.throws(() => StructuredField.parse('?-0', 'item'), {
				name: 'ParsingError',
				message: 'invalid boolean value @ position: 1'
			})
		})

		it('should handle Date item', () => {
			const result = StructuredField.parse('@1659578233', 'item')
			assert.deepEqual(result, { bare_item: 1659578233, parameters: new Map() })
			const date = Temporal.Instant.fromEpochMilliseconds(result.bare_item * 1000)
			assert.equal(date.toJSON(), '2022-08-04T01:57:13Z')
		})

		it('should handle byte sequence item', () => {
			const str = 'pretend this is binary content.'
			const encoder = new TextEncoder()
			const encodedStr = encoder.encode(str)
			const result = StructuredField.parse(':cHJldGVuZCB0aGlzIGlzIGJpbmFyeSBjb250ZW50Lg==:', 'item')
			assert.deepEqual(result, { bare_item: encodedStr, parameters: new Map() })
		})

		it('should handle empty byte sequence item', () => {
			const result = StructuredField.parse('::', 'item')
			assert.deepEqual(result, { bare_item: Uint8Array.from([]), parameters: new Map() })
		})

		it('should throw on byte sequence with whitespace item', () => {
			assert.throws(() => StructuredField.parse(':     :', 'item'), {
				name: 'ParsingError',
				message: 'byte sequence invalid char @ position: 7'
			})
		})

		it('should handle byte sequence item (bad padding loose mode)', () => {
			const result = StructuredField.parse(':aGVsbG8:', 'item', { lastChunkHandling: 'loose' })
			assert.deepEqual(result, { bare_item: Uint8Array.from([ 104, 101, 108, 108, 111 ]), parameters: new Map() })
		})

		it('should throw on byte sequence (bad padding strict mode))', () => {
			assert.throws(() => StructuredField.parse(':aGVsbG8:', 'item', { lastChunkHandling: 'strict'}), {
				name: 'ParsingError',
				message: 'byte sequence invalid encoding @ position: 9',
				// cause: new SyntaxError('')
			})
		})

		// it('should throw on byte sequence as base64url)', () => {
		// 	assert.throws(() => StructuredField.parse(':_-Ah:', 'item'), {
		// 		name: 'ParsingError',
		// 		message: 'byte sequence invalid encoding @ position: 6',
		// 		cause: new SyntaxError('Found a character that cannot be part of a valid base64 string.')
		// 	})
		// })

		it('should handle display-string item (emoji)', () => {
			const result = StructuredField.parse('%"%f0%9f%91%a9%f0%9f%8f%bb%e2%80%8d%e2%9d%a4%ef%b8%8f%e2%80%8d%f0%9f%92%8b%e2%80%8d%f0%9f%91%a9%f0%9f%8f%bc"', 'item')
			assert.deepEqual(result, { bare_item: '👩🏻‍❤️‍💋‍👩🏼', parameters: new Map() })
		})

		it('should handle display-string item (text)', () => {
			const result = StructuredField.parse('%"This is intended for display to %c3%bcsers."', 'item')
			assert.deepEqual(result, { bare_item: 'This is intended for display to üsers.', parameters: new Map() })
		})

		it('should handle display-string item (encoded)', () => {
			const result = StructuredField.parse(`%"${encodeURIComponent('TEST 1 2 3')}"`, 'item')
			assert.deepEqual(result, { bare_item: 'TEST 1 2 3', parameters: new Map() })
		})

		it('should throw display-string parse failure', () => {
			assert.throws(() => StructuredField.parse('%\"%c3%28\"', 'item'), {
				name: 'ParsingError',
				message: 'display string decoding error @ position: 9',
				// cause: new TypeError('The encoded data was not valid for encoding utf-8')
			})
		})

		it('should throw display-string parse failure (missing end quote)', () => {
			assert.throws(() => StructuredField.parse('%\"TEST', 'item'), {
				name: 'ParsingError',
				message: 'display string missing close quote @ position: 6'
			})
		})

		it('should handle display-string with inner BOM', () => {
			const result = StructuredField.parse('%\"BOM: %ef%bb%bf\"', 'item')
			assert.deepEqual(result, { bare_item: 'BOM: \uFEFF', parameters: new Map() })
		})

		it('should handle display-string with starting encoded BOM', () => {
			const result = StructuredField.parse('%\"%ef%bb%bfBOM\"', 'item')
			assert.deepEqual(result, { bare_item: 'BOM', parameters: new Map() })
		})

		it('should handle display-string with starting BOM', () => {
			assert.throws(() => StructuredField.parse('%\"\uFEFFBOM\"', 'item'), {
				name: 'ParsingError',
				message: 'display string invalid char @ position: 3'
			})
		})

		it('should throw on BOM at start of input', () => {
			const encoder = new TextEncoder()
			const encoded = encoder.encode('\uFEFF%\"WITH BOM\"')
			const result = StructuredField.parse(encoded, 'item')
			assert.deepEqual(result, { bare_item: 'WITH BOM', parameters: new Map() })
		})

		it('should handle string item with escape quote', () => {
			const result = StructuredField.parse(`"A \\"TEST\\" STRING"`, 'item')
			assert.deepEqual(result, { bare_item: 'A "TEST" STRING', parameters: new Map() })
		})

		it('should throw trailing string backslash', () => {
			assert.throws(() => StructuredField.parse('"TEST\\', 'item'), {
				name: 'ParsingError',
				message: 'string invalid escape at end of input @ position: 6'
			})
		})

		it('should throw string unknown escape', () => {
			assert.throws(() => StructuredField.parse('"TEST\\?"', 'item'), {
				name: 'ParsingError',
				message: 'string invalid escape char @ position: 7'
			})
		})

		it('should throw string invalid char', () => {
			assert.throws(() => StructuredField.parse('"HERE\tTHERE"', 'item'), {
				name: 'ParsingError',
				message: 'string invalid char @ position: 6'
			})
		})

		it('should throw string on missing close quote', () => {
			assert.throws(() => StructuredField.parse('"TEST', 'item'), {
				name: 'ParsingError',
				message: 'string expected closing quote @ position: 5'
			})
		})

		it('should handle dictionary with value', () => {
			const result = StructuredField.parse('a=1', 'dictionary')
			assert.deepEqual(result, new Map([
				[ 'a', { bare_item: 1, parameters: new Map()} ]
			]))
		})

		it('should handle dictionary with value (multiple)', () => {
			const result = StructuredField.parse('a=1, b=2', 'dictionary')
			assert.deepEqual(result, new Map([
				[ 'a', { bare_item: 1, parameters: new Map()} ],
				[ 'b', { bare_item: 2, parameters: new Map()} ]
			]))
		})

		it('should handle simple inner list', () => {
			const result = StructuredField.parse('(one two)', 'list')
			assert.deepEqual(result, [{ inner_list: [
				{ bare_item: 'one', parameters: new Map() },
				{ bare_item: 'two', parameters: new Map() },
			], parameters: new Map() }])
		})

		it('should throw inner list missing close', () => {
			assert.throws(() => StructuredField.parse('(a b c', 'list'), {
				name: 'ParsingError',
				message: 'inner-list expected sp or close parentheses @ position: 6'
			})
		})

	})
})
