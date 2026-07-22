import { StructuredFieldParser } from './parse.js'
import { StructuredFieldSerializer } from './serialize.js'

/** @import { FieldType } from './defs.js' */
/** @import { ParsingInput, ParsingOptions } from './parse.js'  */
/** @import { ItemTypeWithParameters, ItemOrInnerListWithParameters } from './serialize.js' */

export class StructuredField {
	/**
	 * @param {ParsingInput|Array<ParsingInput>} input
	 * @param {FieldType} field_type
	 * @param {ParsingOptions} [options]
	 */
	static parse(input, field_type, options) { return StructuredFieldParser.parse(input, field_type, options) }

	/**
	 * @param {ItemTypeWithParameters|Map<string, ItemOrInnerListWithParameters>|Array<ItemOrInnerListWithParameters>} structure
	 * @returns {string|undefined}
	 */
	static encode(structure) { return StructuredFieldSerializer.serialize(structure) }
}
