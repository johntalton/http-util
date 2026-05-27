import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SecFetch } from '@johntalton/http-util/headers'

describe('SecFetch', () => {
	describe('parseSite', () => {
		it('should handle undefined', () => {
			const result = SecFetch.parseSite(undefined)
			assert.equal(result, undefined)
		})

		it('should reject unknown', () => {
			const result = SecFetch.parseSite('FAKE-TESTING')
			assert.equal(result, undefined)
		})

		it('should handle same-site', () => {
			const result = SecFetch.parseSite('same-site')
			assert.equal(result, 'same-site')
		})
	})

	describe('parseMode', () => {
		it('should handle undefined', () => {
			const result = SecFetch.parseMode(undefined)
			assert.equal(result, undefined)
		})

		it('should reject unknown', () => {
			const result = SecFetch.parseMode('FAKE_TESTING')
			assert.equal(result, undefined)
		})

		it('should handle cors', () => {
			const result = SecFetch.parseMode('cors')
			assert.equal(result, 'cors')
		})

	})

	describe('parseDestination', () => {
		it('should handle undefined', () => {
			const result = SecFetch.parseDestination(undefined)
			assert.equal(result, undefined)
		})

		it('should reject unknown', () => {
			const result = SecFetch.parseDestination('TESTING')
			assert.equal(result, undefined)
		})

		it('should handle document', () => {
			const result = SecFetch.parseDestination('document')
			assert.equal(result, 'document')
		})
	})
})
