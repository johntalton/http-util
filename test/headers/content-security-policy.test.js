import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ContentSecurityPolicy } from '@johntalton/http-util/headers'

describe('ContentSecurityPolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = ContentSecurityPolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle basic', () => {
			const result = ContentSecurityPolicy.encode({
				defaultSrc: 'self',
				connectSrc: ContentSecurityPolicy.host('galerie.internal:9413'),
				imgSrc: [
					'self',
					ContentSecurityPolicy.host('https://picsum.photo'),
					ContentSecurityPolicy.host('https://fastly.picsum.photo')
				],
			})
			assert.equal(result, 'default-src \'self\'; connect-src galerie.internal:9413; img-src \'self\' https://picsum.photo https://fastly.picsum.photo')
		})

		it('should handle script with hash', () => {
			const result = ContentSecurityPolicy.encode({
				defaultSrc: 'self',
				scriptSrc: [
					'self',
					'sha256-gaBHBjs1eTLOF8v2tQTK7YKsrBSHNOX1V8lfrLqeKCw=',
					'sha256-6JL+4Xrqtk7kpCeSdZIMkln6lLgoEEWxJTGpDaA12IA='
				]
			})
			assert.equal(result, 'default-src \'self\'; script-src \'self\' \'sha256-gaBHBjs1eTLOF8v2tQTK7YKsrBSHNOX1V8lfrLqeKCw=\' \'sha256-6JL+4Xrqtk7kpCeSdZIMkln6lLgoEEWxJTGpDaA12IA=\'')
		})

		it('should handle empty array', () => {
			const result = ContentSecurityPolicy.encode([])
			assert.deepEqual(result, undefined)
		})

		it('should handle array with empty object', () => {
			const result = ContentSecurityPolicy.encode([ {} ])
			assert.deepEqual(result, undefined)
		})

		it('should handle policy with any host', () => {
			const result = ContentSecurityPolicy.encode([ {
				defaultSrc: 'none',
				imgSrc: ContentSecurityPolicy.host('*')
			} ])
			assert.deepEqual(result, 'default-src \'none\'; img-src *')
		})

		it('should handle fetch default with report-to', () => {
			const result = ContentSecurityPolicy.encode({
				defaultSrc: 'self',
				reportTo: 'csp-endpoint'
			})

			assert.equal(result, 'default-src \'self\'; report-to csp-endpoint')
		})

		it('should handle fetch default with report-to undefined', () => {
			const result = ContentSecurityPolicy.encode({
				defaultSrc: 'self',
				reportTo: undefined
			})

			assert.equal(result, 'default-src \'self\'')
		})

		it('should handle fetch default with report-to empty string', () => {
			const result = ContentSecurityPolicy.encode({
				defaultSrc: 'self',
				reportTo: ''
			})

			assert.equal(result, 'default-src \'self\'')
		})

		it('should handle script with hash and unsafe', () => {
			const result = ContentSecurityPolicy.encode({
				scriptSrc: [ 'unsafe-hashes', 'sha256-jzgBGA4UWFFmpOBq0JpdsySukE1FrEN5bUpoK8Z29fY=' ]

			})
			assert.equal(result, 'script-src \'unsafe-hashes\' \'sha256-jzgBGA4UWFFmpOBq0JpdsySukE1FrEN5bUpoK8Z29fY=\'')
		})

		it('should handle dual policy', () => {
			const result = ContentSecurityPolicy.encode([
				{
					defaultSrc: [
						'self',
						ContentSecurityPolicy.host('http://example.com http://example.net')
					],
					connectSrc: 'none'
				},
				{
					connectSrc: ContentSecurityPolicy.host('http://example.com/'),
					scriptSrc: ContentSecurityPolicy.host('http://example.com/')
				}
			])

			assert.equal(result, 'default-src \'self\' http://example.com http://example.net; connect-src \'none\', script-src http://example.com/; connect-src http://example.com/',)
		})

		it('should handle dual policy (as Array)', () => {
			const result = ContentSecurityPolicy.encode([
				{
					defaultSrc: [
						'self',
						ContentSecurityPolicy.host('http://example.com http://example.net')
					],
					connectSrc: 'none'
				},
				{
					connectSrc: ContentSecurityPolicy.host('http://example.com/'),
					scriptSrc: ContentSecurityPolicy.host('http://example.com/')
				}
			], true)

			assert.deepEqual(result, [
				'default-src \'self\' http://example.com http://example.net; connect-src \'none\'',
				'script-src http://example.com/; connect-src http://example.com/',
			])
		})

		it('should handle document base uri as none', () => {
			const result = ContentSecurityPolicy.encode({
				baseUri: 'none'
			})
			assert.equal(result, 'base-uri \'none\'')
		})

		it('should handle document base uri as self', () => {
			const result = ContentSecurityPolicy.encode({
				baseUri: 'self'
			})
			assert.equal(result, 'base-uri \'self\'')
		})

		it('should handle document base uri as scheme', () => {
			const result = ContentSecurityPolicy.encode({
				baseUri: 'https:'
			})
			assert.equal(result, 'base-uri \'https:\'')
		})

		it('should handle document base uri as scheme', () => {
			const result = ContentSecurityPolicy.encode({
				baseUri: ContentSecurityPolicy.host('fake.fake')
			})
			assert.equal(result, 'base-uri fake.fake')
		})

		it('should handle sandbox true', () => {
			const result = ContentSecurityPolicy.encode({
				sandbox: true,
			})
			assert.equal(result, 'sandbox')
		})

		it('should handle sandbox false', () => {
			const result = ContentSecurityPolicy.encode({
				sandbox: false,
			})
			assert.equal(result, undefined)
		})

		it('should handle sandbox false with other directives', () => {
			const result = ContentSecurityPolicy.encode({
				sandbox: false,
				connectSrc: 'none'
			})
			assert.equal(result, 'connect-src \'none\'')
		})

		it('should handle sandbox with allow', () => {
			const result = ContentSecurityPolicy.encode({
				sandbox: 'allow-same-origin',
			})
			assert.equal(result, 'sandbox allow-same-origin')
		})

		it('should handle sandbox with multi-allow', () => {
			const result = ContentSecurityPolicy.encode({
				sandbox: [ 'allow-popups', 'allow-modals' ],
			})
			assert.equal(result, 'sandbox allow-popups allow-modals')
		})

		it('should handle sandbox with multi-allow with other directives', () => {
			const result = ContentSecurityPolicy.encode({
				sandbox: [ 'allow-popups', 'allow-modals' ],
				connectSrc: 'https:'
			})
			assert.equal(result, 'connect-src \'https:\'; sandbox allow-popups allow-modals')
		})

		it('should handle navigation frame ancestors self', () => {
			const result = ContentSecurityPolicy.encode({
				frameAncestors: 'self'
			})
			assert.equal(result, 'frame-ancestors \'self\'')
		})

		it('should handle navigation frame ancestors none', () => {
			const result = ContentSecurityPolicy.encode({
				frameAncestors: 'none'
			})
			assert.equal(result, 'frame-ancestors \'none\'')
		})

		it('should handle navigation frame ancestors schema', () => {
			const result = ContentSecurityPolicy.encode({
				frameAncestors: 'blob:'
			})
			assert.equal(result, 'frame-ancestors \'blob:\'')
		})

		it('should handle navigation frame ancestors empty array ', () => {
			const result = ContentSecurityPolicy.encode({
				frameAncestors: [  ]
			})
			assert.equal(result, 'frame-ancestors')
		})

		it('should handle navigation frame ancestors multiple ', () => {
			const result = ContentSecurityPolicy.encode({
				frameAncestors: [ 'blob:', 'https:' ]
			})
			assert.equal(result, 'frame-ancestors \'blob:\' \'https:\'')
		})

		it('should handle navigation frame ancestors host', () => {
			const result = ContentSecurityPolicy.encode({
				frameAncestors: ContentSecurityPolicy.host('localhost.internal')
			})
			assert.equal(result, 'frame-ancestors localhost.internal')
		})

		it('should handle navigation form action empty array ', () => {
			const result = ContentSecurityPolicy.encode({
				formAction: [  ]
			})
			assert.equal(result, 'form-action')
		})

		it('should handle navigation form none ', () => {
			const result = ContentSecurityPolicy.encode({
				formAction: 'none'
			})
			assert.equal(result, 'form-action \'none\'')
		})

		it('should handle trusted types true', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: true
			})
			assert.equal(result, 'trusted-types')
		})

		it('should handle trusted types false', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: false
			})
			assert.equal(result, undefined)
		})

		it('should handle trusted types undefined', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: undefined
			})
			assert.equal(result, undefined)
		})

		it('should handle trusted types none', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: 'none'
			})
			assert.equal(result, 'trusted-types \'none\'')
		})

		it('should handle trusted types policy name', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: ContentSecurityPolicy.policyName('pol1')
			})
			assert.equal(result, 'trusted-types pol1')
		})

		it('should handle trusted types empty array of policy name', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: []
			})
			assert.equal(result, 'trusted-types')
		})

		it('should handle trusted types multiple policy name', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: [ 'pol1', 'pol2' ].map(ContentSecurityPolicy.policyName)
			})
			assert.equal(result, 'trusted-types pol1 pol2')
		})

		it('should handle trusted types multiple policy name (reject duplicates)', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: [ 'pol1', 'pol2' ].map(ContentSecurityPolicy.policyName)
			})
			assert.equal(result, 'trusted-types pol1 pol2')
		})

		it('should handle trusted types empty object', () => {
			// @ts-ignore
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
				}
			})
			assert.equal(result, 'trusted-types')
		})

		it('should handle trusted types undefined array of names ', () => {
			// @ts-ignore
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
					policyNames: undefined
				}
			})
			assert.equal(result, 'trusted-types')
		})

		it('should handle trusted types object empty array of names ', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
					policyNames: []
				}
			})
			assert.equal(result, 'trusted-types')
		})

		it('should handle trusted types policy name (object format single item)', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
					policyNames: ContentSecurityPolicy.policyName('pol1')
				}
			})
			assert.equal(result, 'trusted-types pol1')
		})

		it('should handle trusted types multiple policy name (object format array of names)', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
					policyNames: [ 'pol1', 'pol2' ].map(ContentSecurityPolicy.policyName)
				}
			})
			assert.equal(result, 'trusted-types pol1 pol2')
		})

		it('should handle trusted types multiple policy name (object format with duplicates)', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
					policyNames: [ 'pol1', 'pol2' ].map(ContentSecurityPolicy.policyName),
					allowDuplicates: true
				}
			})
			assert.equal(result, 'trusted-types pol1 pol2 \'allow-duplicates\'')
		})

		it('should handle required trusted types for in conjunction with trusted types', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: {
					policyNames: [ 'pol1' ].map(ContentSecurityPolicy.policyName)
				},
				requireTrustedTypesFor: 'script'
			})
			assert.equal(result, 'require-trusted-types-for \'script\'; trusted-types pol1')
		})

		it('should allow trusted type policy of any', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: ContentSecurityPolicy.policyName('*')
			})
			assert.equal(result, 'trusted-types *')
		})

		it('should allow trusted type policy names with symbols', () => {
			const result = ContentSecurityPolicy.encode({
				trustedTypes: ContentSecurityPolicy.policyName('pol1-#test')
			})
			assert.equal(result, 'trusted-types pol1-#test')
		})

		it('should reject trusted type policy names with disallowed symbols', () => {
			assert.throws(() => ContentSecurityPolicy.encode({
				trustedTypes: ContentSecurityPolicy.policyName('pol1!!!!')
			}), {
				name: 'TypeError',
				message: 'Not a valid CSP Policy Name'
			})
		})

		//
		// Content-Security-Policy-Report-Only: default-src 'none'; info-src 'none'; report-uri /csp-violation-endpoint;
		// Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; report-uri /csp-violation-endpoint;
		// Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://trusted-cdn.com https://google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.com; connect-src 'self' https://api.example.com; report-uri /csp-violation-endpoint;
		// Content-Security-Policy-Report-Only: default-src 'self'; script-src 'nonce-rAnd0m210626' 'strict-dynamic' https:; object-src 'none'; base-uri 'self'; report-uri /csp-violation-endpoint;
		// default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';base-uri 'self';form-action 'self'
	})
})
