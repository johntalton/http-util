import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { IntegrityPolicy, ReportingEndpoints } from '@johntalton/http-util/headers'

describe('IntegrityPolicy', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = IntegrityPolicy.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty list', () => {
			const result = IntegrityPolicy.encode([])
			assert.equal(result, undefined)
		})

		it('should handle undefined with empty object', () => {
      const result = IntegrityPolicy.encode([ {} ])
      assert.equal(result, undefined)
    })

		it('should handle single item', () => {
      const result = IntegrityPolicy.encode({
				blockedDestinations: 'script',
				endpoints: [ 'integrity-endpoint', 'backup-integrity-endpoint'].map(ReportingEndpoints.name)
			})
      assert.equal(result, 'blocked-destinations=(script),endpoints=(integrity-endpoint backup-integrity-endpoint)')
    })

		it('should handle single item array', () => {
      const result = IntegrityPolicy.encode([{
				blockedDestinations: 'script',
				endpoints: [ 'integrity-endpoint', 'backup-integrity-endpoint'].map(ReportingEndpoints.name)
			}])
      assert.equal(result, 'blocked-destinations=(script),endpoints=(integrity-endpoint backup-integrity-endpoint)')
    })

		it('should handle all directives', () => {
      const result = IntegrityPolicy.encode([{
				blockedDestinations: ['script', 'style'],
				sources: 'inline',
				endpoints: ReportingEndpoints.name('integrity-endpoint')
			}])
      assert.equal(result, 'blocked-destinations=(script style),sources=(inline),endpoints=(integrity-endpoint)')
    })

		it('should handle multi item array', () => {
      const result = IntegrityPolicy.encode([{
				blockedDestinations: 'script'
			}, {
				endpoints: [ 'integrity-endpoint', 'backup-integrity-endpoint'].map(ReportingEndpoints.name)
			}])
      assert.equal(result, 'blocked-destinations=(script), endpoints=(integrity-endpoint backup-integrity-endpoint)')
    })

		it('should handle multi item array (asArray)', () => {
      const result = IntegrityPolicy.encode([{
				blockedDestinations: 'script'
			}, {
				endpoints: [ 'integrity-endpoint', 'backup-integrity-endpoint'].map(ReportingEndpoints.name)
			}], true)
      assert.deepEqual(result, [ 'blocked-destinations=(script)', 'endpoints=(integrity-endpoint backup-integrity-endpoint)' ])
    })

	})
})
