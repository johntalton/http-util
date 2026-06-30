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
				connectSrc: ContentSecurityPolicy.Host('galerie.internal:9413'),
				imgSrc: [
					'self',
					ContentSecurityPolicy.Host('https://picsum.photo'),
					ContentSecurityPolicy.Host('https://fastly.picsum.photo')
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
			assert.equal(result, 'default-src \'self\'; script-src \'self\' sha256-gaBHBjs1eTLOF8v2tQTK7YKsrBSHNOX1V8lfrLqeKCw= sha256-6JL+4Xrqtk7kpCeSdZIMkln6lLgoEEWxJTGpDaA12IA=')
		})

		it('should handle empty array', () => {
			const result = ContentSecurityPolicy.encode([])
			assert.deepEqual(result, undefined)
		})

		it('should handle array with empty object', () => {
			const result = ContentSecurityPolicy.encode([ {} ])
			assert.deepEqual(result, undefined)
		})


		// script-src https://cdn.example.com/scripts/; object-src 'none'
		// default-src 'none'; img-src *

		it('should handle dual policy', () => {
			const result = ContentSecurityPolicy.encode([
				{
					defaultSrc: [
						'self',
						ContentSecurityPolicy.Host('http://example.com http://example.net')
					],
					connectSrc: 'none'
				},
				{
					connectSrc: ContentSecurityPolicy.Host('http://example.com/'),
					scriptSrc: ContentSecurityPolicy.Host('http://example.com/')
				}
			], true)

			assert.deepEqual(result, [
				'default-src \'self\' http://example.com http://example.net; connect-src \'none\'',
				'script-src http://example.com/; connect-src http://example.com/',
			])
		})



		// Content-Security-Policy-Report-Only: default-src 'none'; info-src 'none'; report-uri /csp-violation-endpoint;
		// Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; report-uri /csp-violation-endpoint;
		// Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://trusted-cdn.com https://google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.com; connect-src 'self' https://api.example.com; report-uri /csp-violation-endpoint;
		// Content-Security-Policy-Report-Only: default-src 'self'; script-src 'nonce-rAnd0m210626' 'strict-dynamic' https:; object-src 'none'; base-uri 'self'; report-uri /csp-violation-endpoint;
		// default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';base-uri 'self';form-action 'self'
	})
})
