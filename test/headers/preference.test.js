import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Preferences, AppliedPreferences } from '@johntalton/http-util/headers'

describe('Preferences', () => {
	describe('parse', () => {
		it('should handle undefined', () => {
			const result = Preferences.parse(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty string', () => {
			const result = Preferences.parse('')
			assert.deepEqual(result, {
				asynchronous: false,
  			handling: undefined,
  			preferences: new Map(),
  			representation: undefined,
  			timezone: undefined,
  			wait: undefined
			})
		})

		it('should handle common values', () => {
			const result = Preferences.parse('handling=lenient, wait=100, respond-async')
			assert.deepEqual(result, {
				asynchronous: true,
  			handling: 'lenient',
  			preferences: new Map([
					[ 'handling', { value: 'lenient', parameters: new Map() } ],
					[ 'respond-async', { value: undefined, parameters: new Map() } ],
					[ 'wait', { value: '100', parameters: new Map() } ]
				]),
  			representation: undefined,
  			timezone: undefined,
  			wait: 100
			})
		})

		it('should handle quoted values', () => {
			const result = Preferences.parse('handling="lenient"')
			assert.deepEqual(result, {
				asynchronous: false,
  			handling: 'lenient',
  			preferences: new Map([
					[ 'handling', { value: 'lenient', parameters: new Map() } ],
				]),
  			representation: undefined,
  			timezone: undefined,
  			wait: undefined
			})
		})

		it('should handle empty quoted values', () => {
			const result = Preferences.parse('handling=""')
			assert.deepEqual(result, {
				asynchronous: false,
  			handling: undefined,
  			preferences: new Map([
					[ 'handling', { value: undefined, parameters: new Map() } ],
				]),
  			representation: undefined,
  			timezone: undefined,
  			wait: undefined
			})
		})

		it('should handle other known keys', () => {
			const result = Preferences.parse('return="minimal", timezone=America/Los_Angeles')
			assert.deepEqual(result, {
				asynchronous: false,
  			handling: undefined,
  			preferences: new Map([
					[ 'return', { value: 'minimal', parameters: new Map() } ],
					[ 'timezone', { value: 'America/Los_Angeles', parameters: new Map() } ],
				]),
  			representation: 'minimal',
  			timezone: 'America/Los_Angeles',
  			wait: undefined
			})
		})

		it('should handle parameters', () => {
			const result = Preferences.parse('return=minimal; foo="TEST PARAM"')
			assert.deepEqual(result, {
				asynchronous: false,
  			handling: undefined,
  			preferences: new Map([
					[ 'return', { value: 'minimal', parameters: new Map([
						[ 'foo', 'TEST PARAM' ]
					]) } ],
				]),
  			representation: 'minimal',
  			timezone: undefined,
  			wait: undefined
			})
		})

	})
})

describe('AppliedPreferences', () => {
	describe('encode', () => {
		it('should handle undefined', () => {
			const result = AppliedPreferences.encode(undefined)
			assert.equal(result, undefined)
		})

		it('should handle empty', () => {
			const result = AppliedPreferences.encode({
			})
			assert.equal(result, '')
		})

		it('should handle wait', () => {
			const result = AppliedPreferences.encode({
				wait: 1000
			})
			assert.equal(result, 'wait=1000')
		})

		it('should handle drop of async false', () => {
			const result = AppliedPreferences.encode({
				asynchronous: false,
				wait: 1000
			})
			assert.equal(result, 'wait=1000')
		})

		it('should handle empty custom preferences', () => {
			const result = AppliedPreferences.encode({
				asynchronous: true,
				preferences: new Map()
			})
			assert.equal(result, 'respond-async')
		})

		it('should handle custom preferences', () => {
			const result = AppliedPreferences.encode({
				asynchronous: true,
				preferences: new Map([ [ 'wait', { value: '1000' } ] ])
			})
			assert.equal(result, 'wait=1000,respond-async')
		})

		it('should handle override async when set both ways', () => {
			const result = AppliedPreferences.encode({
				asynchronous: false,
				wait: 42,
				preferences: new Map([ [ 'respond-async', { value: 'true' } ] ])
			})
			assert.equal(result, 'wait=42')
		})

		it('should handle setting all known keys', () => {
			const result = AppliedPreferences.encode({
				asynchronous: true,
				representation: 'minimal',
				handling: 'lenient',
				wait: 42,
				timezone: 'UTC'

			})
			assert.equal(result, 'respond-async,return=minimal,handling=lenient,wait=42,timezone=UTC')
		})

		it('should handle values from Map', () => {
			const result = AppliedPreferences.encode(new Map([
				[ 'wait', '1000' ]
			]))
			assert.equal(result, 'wait=1000')
		})


	})
})
