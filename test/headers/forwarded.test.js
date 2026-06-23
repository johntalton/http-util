import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Forwarded } from '@johntalton/http-util/headers'

describe('Forwarded', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Forwarded.parse(undefined)
			assert.deepEqual(result, [])
		})

		it('should throw on null', () => {
			assert.throws(() => Forwarded.parse(null), {
				name: 'TypeError',
				message: 'parameter must be a string'
			})
		})

		it('should handle empty string', () => {
			const result = Forwarded.parse('')
			assert.deepEqual(result, [])
		})

		it('should handle invalid format', () => {
			const result = Forwarded.parse('NOT A VALID STR')
			assert.deepEqual(result, [])
		})

		it('should drop if missing for', () => {
			const result = Forwarded.parse('host="fake.com";proto=FTP')
			assert.deepEqual(result, [])
		})

		it('should handle complex header', () => {
			const result = Forwarded.parse('for=192.0.2.43, for=198.51.100.17;by=203.0.113.60;proto=http;host="example.com"')
			assert.deepEqual(result, [
				new Map(Object.entries({ for: '192.0.2.43' })),
				new Map(Object.entries({ for: '198.51.100.17', by: '203.0.113.60', proto: 'http', host: 'example.com' }))
			])
		})

		it('should handle ipv6 values', () => {
			const result = Forwarded.parse('for=192.0.2.43, for="[2001:db8:cafe::17]",for=unknown')
			assert.deepEqual(result, [
				new Map(Object.entries({ for: '192.0.2.43' })),
				new Map(Object.entries({ for: '[2001:db8:cafe::17]' })),
				new Map(Object.entries({ for: 'unknown' }))
			])
		})

		it('should drop unknown keys', () => {
			const result = Forwarded.parse('for=192.0.2.43, FAKE=42')
			assert.deepEqual(result, [
				new Map(Object.entries({ for: '192.0.2.43' }))
			])
		})

		it('should handle custom keys', () => {
			const result = Forwarded.parse('for=192.0.2.43;\tcustom=testing', [ 'for', 'custom' ])
			assert.deepEqual(result, [
				new Map(Object.entries({ for: '192.0.2.43', custom: 'testing' }))
			])
		})

	})

	describe('selectRightMost', () => {
		it('should handle undefined', () => {
			const result = Forwarded.selectRightMost(undefined)
			assert.deepEqual(result, undefined)
		})

		it('should handle empty list', () => {
			const result = Forwarded.selectRightMost([])
			assert.deepEqual(result, undefined)
		})

		it('should select right most from single ', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' }))
			])
			assert.deepEqual(result, new Map(Object.entries({ for: '1.1.1.1' })))
		})

		it('should select right most', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' })),
				new Map(Object.entries({ for: '2.2.2.2' }))
			])
			assert.deepEqual(result, new Map(Object.entries({ for: '2.2.2.2' })))
		})

		it('should select right most skipping named ip', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' })),
				new Map(Object.entries({ for: '2.2.2.2' }))
			], [
				'2.2.2.2'
			])
			assert.deepEqual(result, new Map(Object.entries({ for: '1.1.1.1' })))
		})

		it('should select right most skipping any ip', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' })),
				new Map(Object.entries({ for: '2.2.2.2' }))
			], [
				'*'
			])
			assert.deepEqual(result, new Map(Object.entries({ for: '1.1.1.1' })))
		})

		it('should select right most skipping mixed', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' })),
				new Map(Object.entries({ for: '2.2.2.2' })),
				new Map(Object.entries({ for: '3.3.3.3' })),
				new Map(Object.entries({ for: '4.4.4.4' }))
			], [
				'*',
				'3.3.3.3'
			])
			assert.deepEqual(result, new Map(Object.entries({ for: '2.2.2.2' })))
		})

		it('should skip all ', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' }))
			], [
				'*'
			])
			assert.deepEqual(result, undefined)
		})

		it('should reject unmatched skip list ', () => {
			const result = Forwarded.selectRightMost([
				new Map(Object.entries({ for: '1.1.1.1' }))
			], [
				'9.9.9.9'
			])
			assert.deepEqual(result, undefined)
		})
	})
})
