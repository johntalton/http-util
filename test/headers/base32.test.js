import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Base32 } from '@johntalton/http-util/util'

describe('Base32', () => {
	describe('encode', () => {
		// it('should handle undefined')

		it('should handle basic example', () => {
			const encoder = new TextEncoder()
			const u8 = encoder.encode('Lorem ipsum dolor sit amet')
			const result = Base32.encode(u8)
			assert.equal(result, 'JRXXEZLNEBUXA43VNUQGI33MN5ZCA43JOQQGC3LFOQ======')
		})
	})

	describe('decode', () => {
		// it('should handle undefined')

		it('should handle basic example', () => {
			const u8 = Base32.decode('OBZGK5DFNZSCA5DINFZSA2LTEBRGS3TBOJ4SAY3PNZ2GK3TUFY======')
			const result = (new TextDecoder()).decode(u8)
			assert.deepEqual(result, 'pretend this is binary content.')
		})

		it('should handle Lorem ipsum', () => {
			const u8 = Base32.decode('JRXXEZLNEBUXA43VNUQGI33MN5ZCA43JOQQGC3LFOQ======')
			const result = (new TextDecoder()).decode(u8)
			assert.deepEqual(result, 'Lorem ipsum dolor sit amet')
		})
	})
})
