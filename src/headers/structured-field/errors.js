export const SF_ERROR = {
	PARSER: {
		NOT_EMPTY: 'trailing input not empty',
		MISSING_COMMA_IN_LIST: 'list expected comma',
		LIST_TRAILING_COMMA: 'list trailing comma',
		INNER_LIST_EXPECTED_OPEN: 'inner-list expected open parentheses',
		INNER_LIST_EXPECTED_END: 'inner-list expected sp or close parentheses',
		INNER_LIST_END_NOT_FOUND: 'inner-list expected close parentheses',
		DICTIONARY_EXPECTED_COMMA: 'dictionary expected comma',
		DICTIONARY_TRAILING_COMMA: 'dictionary trailing comma',
		UNRECOGNIZED_TYPE: 'item type unrecognized',
		KEY_INVALID_CHAR: 'key invalid char',
		TOKEN_INVALID_CHAR: 'token invalid char',
		BOOLEAN_INVALID_CHAR: 'boolean invalid prefix',
		BOOLEAN_INVALID_VALUE: 'invalid boolean value',
		DATE_INVALID_PREFIX: 'date invalid prefix',
		DATE_IS_DECIMAL: 'date can not be decimal',
		BYTE_SEQ_INVALID_PREFIX: 'byte sequence invalid prefix',
		BYTE_SEQ_MISSING_END_COLON: 'byte sequence missing colon',
		BYTE_SEQ_INVALID_CHAR: 'byte sequence invalid char',
		BYTE_SEQ_INVALID_ENCODING: 'byte sequence invalid encoding',
		STRING_INVALID_PREFIX: 'string invalid prefix',
		STRING_ESCAPE_EMPTY: 'string invalid escape at end of input',
		STRING_INVALID_ESCAPE_CHAR: 'string invalid escape char',
		STRING_MISSING_DOUBLE_QUOTE: 'string expected closing quote',
		STRING_INVALID_CHAR: 'string invalid char',
		DISPLAY_STRING_INVALID_PREFIX: 'display string invalid prefix',
		DISPLAY_STRING_INVALID_QUOTE_PREFIX: 'display string invalid prefix quote',
		DISPLAY_STRING_INVALID_CHAR: 'display string invalid char',
		DISPLAY_STRING_INVALID_HEX: 'display string invalid hex value',
		DISPLAY_STRING_MISSING_HEX: 'display string missing hex value',
		DISPLAY_STRING_MISSING_QUOTE: 'display string missing close quote',
		DISPLAY_STRING_NOT_LOWERCASE: 'display string escape not lowercase or digit',
		DISPLAY_STRING_FAILED_DECODE: 'display string decoding error',
		NUMBER_EMPTY: 'integer or decimal empty',
		NUMBER_INVALID_DIGIT: 'integer or decimal not a digit',
		NUMBER_MAX_LENGTH: 'integer or decimal max length',
		INTEGER_MAX_LENGTH: 'integer max length',
		DECIMAL_MAX_LENGTH: 'decimal max length',
		DECIMAL_MAX_DIGITS: 'decimal only allows max 3 digits',
		NUMBER_ENDS_IN_DOT: 'decimal can not end in period'

	},
	SERIALIZER: {
		UNKNOWN_TYPE: 'unknown top-level type',

		BARE_ITEM_UNKNOWN: 'unknown item type',

		KEY_INVALID_CHAR: 'key unknown char',
		KEY_INVALID_FIRST_CHAR: 'key invalid first char',

		DECIMAL_NOT_A_DECIMAL: 'decimal incorrect type',
		DECIMAL_OUT_OF_BOUNDS: 'decimal out of bounds',
		INTEGER_OUT_OF_BOUNDS: 'integer out of bounds',

		STRING_INVALID_CHAR: 'string invalid char',

		BOOLEAN_NOT_BOOLEAN: 'boolean incorrect type',

		TOKEN_UNDEFINED: 'token undefined',
		TOKEN_INVALID_FIRST_CHAR: 'token invalid first char',
		TOKEN_INVALID_CHAR: 'token invalid char',

		BYTE_SEQ_INVALID: 'byte sequence invalid',
	}
}

