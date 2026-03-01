/**
 * @typedef {Object} ChallengeItem
 * @property {string} scheme
 * @property {Map<string, string|undefined>} [parameters]
 */

/** @typedef {'invalid_request'|'invalid_token'|'insufficient_scope'} BearerErrorCode */

export const PARAMETERS_THAT_NEED_QUOTES = [
	'realm',
	'charset',
	'domain',
	'nonce',
	'opaque',
	'qop',
	'uri',
	'cnonce',
	'response',
	// 'max-age', // todo should this be included
	'challenge',
	'scope',
	'error',
	'error_description',
	'error_uri'
]

/**
 * @param {string} paramName
 */
export function paramNeedQuotes(paramName) {
	return PARAMETERS_THAT_NEED_QUOTES.includes(paramName.toLowerCase())
}


export class Challenge {
	/**
	 * @param {string} realm
	 * @param {string} [charset='utf-8']
	 * @returns {ChallengeItem}
	 */
	static basic(realm, charset = 'utf-8') {
		const parameters = new Map([ [ 'realm', realm ] ])
		if(charset !== undefined) { parameters.set('charset', charset) }

		return {
			scheme: 'Basic',
			parameters
		}
	}

	/**
	 * @param {string|undefined} [realm]
	 * @param {string|undefined} [scope]
	 * @param {BearerErrorCode} [error]
	 * @param {string} [errorDescription]
	 * @param {string} [errorUri]
	 * @returns {ChallengeItem}
	 */
	static bearer(realm, scope, error, errorDescription, errorUri) {
		const parameters = new Map()
		if(realm !== undefined) { parameters.set('realm', realm) }
		if(scope !== undefined) { parameters.set('scope', scope) }
		if(error !== undefined) { parameters.set('error', error) }
		if(errorDescription !== undefined) { parameters.set('error_description', errorDescription) }

		return {
			scheme: 'Bearer',
			parameters
		}
	}

	/**
	 * @param {string} algorithm
	 * @param {string} [realm]
	 * @returns {ChallengeItem}
	 */
	static digest(algorithm, realm) {
		return {
			scheme: 'Digest'
		}
	}

	/**
	 * @returns {ChallengeItem}
	 */
	static hoba() {
		return {
			scheme: 'HOBA'
		}
	}

	/**
	 * @param {ChallengeItem} challenge
	 */
	static encode(challenge) {
		const parameters = challenge.parameters?.entries().map(([ key, value ]) => {
			if(value === undefined) { return key }
			if(paramNeedQuotes(key)) { return `${key}="${value}"` }
			return `${key}=${value}`
		})

		const params = parameters !== undefined ? [ ...parameters ].join(',') : ''

		return `${challenge.scheme} ${params}`
	}
}

// console.log(Challenge.encode(Challenge.basic('Dev')))
// Basic realm="Dev", charset="UTF-8"

//  HOBA max-age="180", challenge="16:MTEyMzEyMzEyMw==1:028:https://www.example.com:8080:3:MTI48:NjgxNDdjOTctNDYxYi00MzEwLWJlOWItNGM3MDcyMzdhYjUz"

// Digest username="Mufasa",
//     realm="http-auth@example.org",
//     uri="/dir/index.html",
//     algorithm=SHA-256,
//     nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v",
//     nc=00000001,
//     cnonce="f2/wE4q74E6zIJEtWaHKaf5wv/H5QzzpXusqGemxURZJ",
//     qop=auth,
//     response="753927fa0e85d155564e2e272a28d1802ca10daf449
//         6794697cf8db5856cb6c1",
//     opaque="FQhe/qaU925kfnzjCev0ciny7QMkPqMAFRtzCUYo5tdS"

// console.log(Challenge.encode(Challenge.bearer(undefined, 'openid profile email')))
// Bearer scope="openid profile email"
// Bearer scope="urn:example:channel=HBO&urn:example:rating=G,PG-13"

// WWW-Authenticate: Bearer realm="example",
//                        error="invalid_token",
//                        error_description="The access token expired"

