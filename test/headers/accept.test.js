import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Accept } from '@johntalton/http-util/headers'


const ITEM_JSON = {
	name: 'application/json;charset=utf8',
	mimetype: 'application/json',
	type: 'application',
	subtype: 'json',
	parameters: new Map([[ 'charset', 'utf8' ]])
}

const ITEM_JSON_WITHOUT_CHARSET = {
	name: 'application/json',
	mimetype: 'application/json',
	type: 'application',
	subtype: 'json',
	parameters: new Map([])
}

const ITEM_PLAIN = {
	name: 'text/plain;charset=utf8',
	mimetype: 'text/plain',
	type: 'text',
	subtype: 'plain',
	parameters: new Map([[ 'charset', 'utf8' ]])
}

const ITEM_APPLICATION_ANY = {
	name: 'application/*',
	mimetype: 'application/*',
	type: 'application',
	subtype: '*',
	parameters: new Map([])
}

const ITEM_ANY = {
	name: '*',
	mimetype: '*/*',
	type: '*',
	subtype: '*',
	parameters: new Map([])
}



describe('Accept', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Accept.parse(undefined)
			assert.deepEqual(result, [])
		})


	})

	describe('selectItemFrom', () => {
		it('should handle undefined (accepts)', () => {
			const result = Accept.selectItemFrom(undefined, [])
			assert.equal(result, undefined)
		})

		it('should handle non-array (accepts)', () => {
			const result = Accept.selectItemFrom(42, [])
			assert.equal(result, undefined)
		})

		it('should handle empty array (accepts)', () => {
			const result = Accept.selectItemFrom([], [])
			assert.equal(result, undefined)
		})

		it('should handle undefined (supported)', () => {
			const result = Accept.selectItemFrom([ ITEM_JSON ], undefined)
			assert.equal(result, undefined)
		})

		it('should handle non-array (supported)', () => {
			const result = Accept.selectItemFrom([ ITEM_JSON ], 42)
			assert.equal(result, undefined)
		})

		it('should handle empty array (supported)', () => {
			const result = Accept.selectItemFrom([ ITEM_JSON ], [])
			assert.equal(result, undefined)
		})

		it('should handle basic matched', () => {
			const result = Accept.selectItemFrom([ ITEM_JSON ], [ 'application/json' ])
			assert.deepEqual(result, ITEM_JSON)
		})

		it('should handle any match', () => {
			const result = Accept.selectItemFrom([ ITEM_JSON ], [ '*' ])
			assert.deepEqual(result, ITEM_JSON)
		})

		it('should handle any subtype', () => {
			const result = Accept.selectItemFrom([ ITEM_JSON ], [ 'application/*' ])
			assert.deepEqual(result, ITEM_JSON)
		})

		it('should handle accept any match', () => {
			const result = Accept.selectItemFrom([ ITEM_APPLICATION_ANY ], [ 'application/json' ])
			assert.deepEqual(result, {
				...ITEM_JSON_WITHOUT_CHARSET,
				name: ITEM_APPLICATION_ANY.name
			})
		})

		it('should handle complex quality match', () => {
			const anyItem1 = { ...ITEM_ANY, quality: 0.1 }
			const jsonItem4 = { ...ITEM_JSON_WITHOUT_CHARSET, quality: 0.4 }

			const result = Accept.selectItemFrom([ anyItem1, jsonItem4 ], [ 'application/json' ])
			assert.deepEqual(result, {
				name: 'application/json',
				mimetype: 'application/json',
				type: 'application',
				subtype: 'json',
				quality: 0.4,
				parameters: new Map()
			})
		})

		it('should handle complex multiple supported match', () => {
			const anyItem5 = { ...ITEM_ANY, quality: 0.5 }
			const jsonItem4 = { ...ITEM_JSON_WITHOUT_CHARSET, quality: 0.4 }

			const result = Accept.selectItemFrom([ anyItem5, jsonItem4 ], [ 'text/plain', 'application/json' ])
			assert.deepEqual(result, {
				name: '*',
				mimetype: 'text/plain',
				type: 'text',
				subtype: 'plain',
				quality: 0.5,
				parameters: new Map()
			})
		})

		it('should handle complex multiple supported match (swap supported order)', () => {
			const anyItem5 = { ...ITEM_ANY, quality: 0.5 }
			const jsonItem4 = { ...ITEM_JSON_WITHOUT_CHARSET, quality: 0.4 }

			const result = Accept.selectItemFrom([ anyItem5, jsonItem4 ], [ 'application/json', 'text/plain' ])
			assert.deepEqual(result, {
				name: '*',
				mimetype: 'application/json',
				type: 'application',
				subtype: 'json',
				quality: 0.5,
				parameters: new Map()
			})
		})

		it('should handle any subtype accepts multiple supported', () => {
			const jsonItem1 = { ...ITEM_JSON_WITHOUT_CHARSET, quality: 0.1 }
			const result = Accept.selectItemFrom([ jsonItem1, ITEM_APPLICATION_ANY ], [ 'application/xml', 'application/json' ])
			assert.deepEqual(result, {
				name: 'application/*',
				mimetype: 'application/xml',
				type: 'application',
				subtype: 'xml',
				parameters: new Map()
			})
		})

		it('should handle supported any matching any', () => {
			const result = Accept.selectItemFrom([ ITEM_ANY ], [ '*' ])
			assert.deepEqual(result, {
				name: '*',
				mimetype: '*/*',
				type: '*',
				subtype: '*',
				parameters: new Map()
			})
		})


	})

	describe('selectFrom', () => {

	})

	describe('select', () => {
		it('should handle undefined', () => {
			const result = Accept.select(undefined, undefined)
			assert.equal(result, undefined)
		})

		it('should handle undefined supported', () => {
			const result = Accept.select('', undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty supported', () => {
			const result = Accept.select('', [])
			assert.equal(result, undefined)
		})

		it('should handle basic selection', () => {
			const result = Accept.select('application/json, text/plain', [ 'text/plain' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle drop unsupported mime types', () => {
			const result = Accept.select('text/plain', [ 'text/plain', 'fake-fake' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle any fallback', () => {
			const result = Accept.select('text/plain, *', [ 'application/json' ])
			assert.equal(result, 'application/json')
		})

		it('should handle first best', () => {
			const result = Accept.select('application/json, text/plain;q=.1', [ 'text/plain', 'application/xml' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle any subtype selection', () => {
			const result = Accept.select('application/json, text/*', [ 'text/plain' ])
			assert.equal(result, 'text/plain')
		})

		it('should handle no best match', () => {
			const result = Accept.select('application/json, application/xml', [ 'text/plain' ])
			assert.equal(result, undefined)
		})
	})
})
