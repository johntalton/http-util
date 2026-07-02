import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
	coreHeaders,
	customHeaders,
	performanceHeaders,
	coerceSupportedTypes,
	contextHeaders,
	policyHeaders,
	legacyHeaders
} from '@johntalton/http-util/response'

import { ReportingEndpoints } from '@johntalton/http-util/headers'

/** @import { Metadata } from '@johntalton/http-util/response' */

const DEFAULT_META = {
	performance: [],
	servername: undefined,
	origin: undefined
}

describe('Header Util', () => {
	describe('coreHeaders', () => {
		it('should handle basic values', () => {
			const result = coreHeaders(42, 'text/test', [], structuredClone(DEFAULT_META))
			assert.deepEqual(result, {
				':status': 42,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server',
				'content-type': 'text/test',
				'server': undefined
			})
		})

		it('should handle basic values with additional exposed headers', () => {
			const result = coreHeaders(42, 'text/test', [
				'fake-header', 'another-one'
			], structuredClone(DEFAULT_META))
			assert.deepEqual(result, {
				':status': 42,
				'access-control-allow-origin': undefined,
				'access-control-expose-headers': 'etag,server,fake-header,another-one',
				'content-type': 'text/test',
				'server': undefined
			})
		})

	})

	describe('performanceHeaders', () => {
		it('should', () => {
			const meta = {
				...DEFAULT_META,
				performance: [ { name: 'TEST', duration: 42 } ]
			}
			const result = performanceHeaders(meta)
			assert.deepEqual(result, {
				'Timing-Allow-Origin': undefined,
				'Server-Timing': 'TEST;dur=42'
			})
		})

	})

	describe('customHeaders', () => {
		it('should allow undefined', () => {
			const meta = {
				...DEFAULT_META,
				customHeaders: undefined
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should allow empty array', () => {
			const meta = {
				...DEFAULT_META,
				customHeaders: []
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should filter non X- headers', () => {
			/** @type {Metadata} */
			const meta = {
				...DEFAULT_META,
				// @ts-ignore
				customHeaders: [ [ 'FOO', 'BAR' ]  ]
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should filter non x- headers', () => {
			/** @type {Metadata} */
			const meta = {
				...DEFAULT_META,
				// @ts-ignore
				customHeaders: [ [ 'x-FOO', 'BAR' ]  ]
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, { })
		})

		it('should output valid headers', () => {
			/** @type {Metadata} */
			const meta = {
				...DEFAULT_META,
				customHeaders: [ [ 'X-FOO', 'BAR' ]  ]
			}
			const result = customHeaders(meta)
			assert.deepEqual(result, {
				'X-FOO': 'BAR'
			})
		})

	})

	describe('coerceSupportedTypes', () => {
		it('should handle undefined supportedTypes', () => {
			const result = coerceSupportedTypes('VERB', undefined)
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle undefined methods', () => {
			const result = coerceSupportedTypes(undefined, 'TYPE')
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle methods empty array', () => {
			const result = coerceSupportedTypes([], 'TYPE')
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle methods array', () => {
			const result = coerceSupportedTypes(['PUT'], 'TYPE')
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: undefined,
				patch: undefined
			})
		})

		it('should handle supportedTypes empty array', () => {
			const result = coerceSupportedTypes('PUT', [])
			assert.deepEqual(result, {
				put: undefined,
				post: undefined,
				patch: undefined
			})
		})

		it('should handle supportedTypes array', () => {
			const result = coerceSupportedTypes('PUT', [ 'TYPE' ])
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: undefined,
				patch: undefined
			})
		})

		it('should handle methods array of many (no patch)', () => {
			const result = coerceSupportedTypes(['PUT', 'POST', 'QUERY'], 'TYPE')
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: [ 'TYPE' ],
				patch: undefined
			})
		})

		it('should handle methods array of many (with patch)', () => {
			const result = coerceSupportedTypes(['PUT', 'POST', 'PATCH'], 'TYPE')
			assert.deepEqual(result, {
				put: [ 'TYPE' ],
				post: [ 'TYPE' ],
				patch: [ 'TYPE' ]
			})
		})

		it('should handle supportedTypes array of many', () => {
			const result = coerceSupportedTypes('PUT', ['TYPE/A', 'TYPE/B'])
			assert.deepEqual(result, {
				put: [ 'TYPE/A', 'TYPE/B' ],
				post: undefined,
				patch: undefined
			})
		})

		it('should handle supportedTypes Object', () => {
			const result = coerceSupportedTypes(['PUT', 'POST'], {
				put: 'TYPE/A',
				patch: 'TYPE/B'
			})
			assert.deepEqual(result, {
				put: [ 'TYPE/A' ],
				post: undefined,
				patch: [ 'TYPE/B' ]
			})
		})
	})

	describe('contextHeaders', () => {
		it('should handle undefined', () => {
			const result = contextHeaders(undefined)
			assert.deepEqual(result, {})
		})

		it('should handle empty set', () => {
			const result = contextHeaders({})
			assert.deepEqual(result, {})
		})

		it('should handle basics', () => {
			const result = contextHeaders({
				acceptClientHints: [ 'Save-Data', 'RTT' ],
				appliedPreferences: { wait: 42, handling: 'lenient', representation: 'minimal' },
				clearSiteData: '*',
				links: [ { relation: 'test', url: './test' } ]
			})
			assert.deepEqual(result, {
				'accept-ch': 'Save-Data, RTT',
				'preference-applied': 'return=minimal,handling=lenient,wait=42',
				'clear-site-data': '*',
				'link': '<./test>; rel="test"'
			})
		})
	})

	describe('policyHeaders', () => {
		it('should handle undefined', () => {
			const result = policyHeaders(undefined)
			assert.deepEqual(result, {})
		})

		it('should handle empty set', () => {
			const result = policyHeaders({})
			assert.deepEqual(result, {})
		})

		it('should handle integrity only reportOnly or enforced (enforced)', () => {
			const result = policyHeaders({
				integrity: {
					reportOnly: false,
					blockedDestinations: 'script',
					endpoints: ReportingEndpoints.name('fake')
				}
			})
			assert.deepEqual(result, {
				'integrity-policy': 'blocked-destinations=(script),endpoints=(fake)'
			})
		})

		it('should handle integrity only reportOnly or enforced (reportOnly)', () => {
			const result = policyHeaders({
				integrity: {
					reportOnly: true,
					blockedDestinations: 'script',
					endpoints: ReportingEndpoints.name('fake')
				}
			})
			assert.deepEqual(result, {
				'integrity-policy-report-only': 'blocked-destinations=(script),endpoints=(fake)'
			})
		})

		it('should handle split permission between reportOnly and enforced headers', () => {
			const result = policyHeaders({
				permissions: {
					directive: 'gamepad',
					allowList: '()',
					reportOnly: true
				}
			})
			assert.deepEqual(result, {
				'permissions-policy-report-only': 'gamepad=()'
			})
		})

		it('should handle split CSP between reportOnly and enforce headers', () => {
			const result = policyHeaders({
				CSP: [{
					defaultSrc: 'self'
				}, {
					imgSrc: 'blob:',
					reportOnly: true
				}]
			})
			assert.deepEqual(result, {
				'content-security-policy': 'default-src \'self\'',
				'content-security-policy-report-only': 'img-src \'blob:\''
			})
		})
	})

	describe('legacyHeaders', () => {
		it('should handle undefined', () => {
			const result = legacyHeaders(undefined)
			assert.deepEqual(result, {})
		})

		it('should handle false', () => {
			const result = legacyHeaders(false)
			assert.deepEqual(result, {})
		})

		it('should handle true', () => {
			const result = legacyHeaders(true)
			assert.deepEqual(result, {
				'x-content-type-options': 'nosniff',
				'x-xss-protection': '0'
			})
		})
	})
})
