import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CrossOriginEmbedderPolicy } from '@johntalton/http-util/headers'

describe('CrossOriginEmbedderPolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = CrossOriginEmbedderPolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty policy', () => {
			// @ts-ignore
			const result = CrossOriginEmbedderPolicy.encode({
			})
			assert.equal(result, undefined)
		})

		it('should handle undefined policy directive', () => {
			const result = CrossOriginEmbedderPolicy.encode({
				directive: undefined
			})
			assert.equal(result, undefined)
		})

		it('should handle invalid directive', () => {
			assert.throws(() => CrossOriginEmbedderPolicy.encode({
				directive: 'FAKE'
			}), {
				name: 'TypeError',
				message: 'Invalid COEP Directive'
			})

		})

		it('should handle simple policy', () => {
			const result = CrossOriginEmbedderPolicy.encode({
				directive: 'credentialless'
			})
			assert.equal(result, 'credentialless')
		})

		it('should handle policy with report to', () => {
			const result = CrossOriginEmbedderPolicy.encode({
				directive: 'require-corp',
				reportTo: 'coep-endpoint'
			})
			assert.equal(result, 'require-corp; report-to="coep-endpoint"')
		})
	})
})
