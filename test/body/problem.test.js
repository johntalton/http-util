import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Problem } from '@johntalton/http-util/response'

describe('Problem', () => {
	describe('from', () => {
		it('should handle basic', () => {
			const problem = {
				type: 'urn:test',
				title: 'Test',
				detail: 'This is a Test'
			}
			const instance = 'Instance of a Test'
			const extension = {
				test: true
			}
			const result = Problem.from(problem, instance, extension)

			assert.deepEqual(result, {
				type: 'urn:test',
				title: 'Test',
				detail: 'This is a Test',
				instance: 'Instance of a Test',
				test: true
			})
		})
	})

	describe('template', () => {
		it('should handle undefined', () =>{
			const result = Problem.template(new Map(), 'Test')
			assert.equal(result, undefined)
		})

		it('should not modify registry entry', () =>{
			const registry = new Map([
					[ 'Test', {
						type: 'urn:test',
						title: 'Test',
						detail: 'This is a Test'
					}]
				])

			const result = Problem.template(registry, 'Test')

			assert.ok(result !== undefined)
			assert.equal(result.type, 'urn:test')
			assert.equal(result.title, 'Test')

			result.title = 'SomeOtherTitle'
			assert.equal(result.title, 'SomeOtherTitle')

			assert.equal(registry.get('Test')?.title, 'Test')
		})

		it('should handle basic lookup', () => {
			const registry = new Map([
					[ 'Test', {
						type: 'urn:test',
						title: 'Test',
						detail: 'This is a Test'
					}]
				])

			const instance = 'Instance of a Test'
			const extension = {
				test: true
			}
			const result = Problem.template(registry, 'Test', instance, extension)

			assert.deepEqual(result, {
				type: 'urn:test',
				title: 'Test',
				detail: 'This is a Test',
				instance: 'Instance of a Test',
				test: true
			})
		})
	})
})
