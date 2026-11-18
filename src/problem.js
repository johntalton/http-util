import { CONTENT_TYPE_PROBLEM_JSON } from './headers/content-type.js'

/** @import { SendBody } from './defs.js' */

export const DEFAULT_PROBLEM_TYPE = 'about:blank'

/**
 * @typedef {Object} ProblemBase
 * @property {string} type
 * @property {string} title
 * @property {string} detail
 */

/** @typedef {ProblemBase & { instance?: string|undefined }} ProblemInstance */

/** @typedef {Map<string, ProblemBase>} ProblemRegistry */

/**
 * @see {@link https://www.rfc-editor.org/info/rfc9457}
 */
export class Problem {
	/**
	 * @param {ProblemBase} problem
	 * @param {string|undefined} [instance]
	 * @param {Record<string, any>} [extension]
	 * @returns {ProblemInstance}
	 */
  static from(problem, instance, extension) {
		const { type, title, detail } = problem

		return {
			type,
			title,
			detail,
			instance,
			...extension
		}
  }

	/**
	 * @param {ProblemRegistry} problems
	 * @param {string} key
	 * @param {string|undefined} [instance]
	 * @param {Record<string, any>} [extension]
	 * @returns {ProblemInstance|undefined}
	 */
	static template(problems, key, instance, extension) {
		const base = problems.get(key)
		if(base === undefined) { return undefined }

		return Problem.from(structuredClone(base), instance, extension)
	}

	/**
	 * @param {ProblemInstance|undefined} problem
	 * @param {number} status
	 * @returns {{ contentType: string|undefined, body: SendBody|undefined }}
	 */
	static encode(problem, status) {
		if(problem === undefined) {
			return {
				contentType: undefined,
				body: undefined
			}
		}

		return {
			contentType: CONTENT_TYPE_PROBLEM_JSON,
			body: JSON.stringify({ ...problem, status })
		}
	}
}
