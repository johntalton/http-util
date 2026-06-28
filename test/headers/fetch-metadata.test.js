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

	describe('parseUser', () => {
		it('should handle undefined', () => {
			const result = SecFetch.parseUser(undefined)
			assert.equal(result, false)
		})

		it('should discard unknown', () => {
			const result = SecFetch.parseUser('?TRUE')
			assert.equal(result, false)
		})

		it('should return false when ?0', () => {
			const result = SecFetch.parseUser('?0')
			assert.equal(result, false)
		})

		it('should return true when ?1', () => {
			const result = SecFetch.parseUser('?1')
			assert.equal(result, true)
		})
	})
})

