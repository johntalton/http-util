import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { PermissionsPolicy } from '@johntalton/http-util/headers'

describe('PermissionsPolicy', () => {
  describe('encode', () => {
    it('should handle undefined', () => {
      const result = PermissionsPolicy.encode(undefined)
      assert.equal(result, undefined)
    })

		it('should handle empty array', () => {
      const result = PermissionsPolicy.encode([])
      assert.equal(result, undefined)
    })

		it('should handle directive geolocation any', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: '*'
			})
      assert.equal(result, 'geolocation=*')
    })

		it('should handle directive geolocation empty allow list', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: []
			})
      assert.equal(result, 'geolocation=()')
    })

		// it('should handle directive geolocation directly set to self', () => {
    //   const result = PermissionsPolicy.encode({
		// 		directive: 'geolocation',
		// 		allowList: 'self'
		// 	})
    //   assert.equal(result, 'geolocation=self')
    // })

		it('should handle directive geolocation empty allow list', () => {
      assert.throws(() => PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: ['*']
			}), {
				name: 'TypeError',
				message: 'Allow List can not contain Any'
			})
    })

		it('should handle directive geolocation self only array', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: ['self']
			})
      assert.equal(result, 'geolocation=(self)')
    })

		it('should handle directive geolocation host with wildcard', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: [ '*.fake-host.internal' ]
			})
      assert.equal(result, 'geolocation=("*.fake-host.internal")')
    })


		it('should handle directive geolocation multi item list', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: [
					'self',
					'https://a.example.com',
					'https://b.example.com'
				]
			})
      assert.equal(result, 'geolocation=(self "https://a.example.com" "https://b.example.com")')
    })

		it('should handle multiple directive with empty allow lists', () => {
      const result = PermissionsPolicy.encode([{
				directive: 'microphone',
				allowList: []
			}, {
				directive: 'geolocation',
				allowList: []
			}])
      assert.equal(result, 'microphone=(), geolocation=()')
    })

		it('should handle directive with report to url', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: [],
				reportTo: 'geo_endpoint'
			})
      assert.equal(result, 'geolocation=(); report-to=geo_endpoint')
    })

		it('should handle directive with multiple report to urls', () => {
      const result = PermissionsPolicy.encode([ {
				directive: 'geolocation',
				allowList: [],
				reportTo: 'geo_endpoint'
			}, {
				directive: 'fullscreen',
				allowList: '*',
				reportTo: 'fakeEP'
			} ])
      assert.equal(result, 'geolocation=(); report-to=geo_endpoint, fullscreen=*; report-to=fakeEP')
    })

		it('should handle directive with explicit empty allow list', () => {
      const result = PermissionsPolicy.encode({
				directive: 'geolocation',
				allowList: '()',
			})
      assert.equal(result, 'geolocation=()')
    })

  })
})
