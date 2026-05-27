import { PassThrough } from 'node:stream'

/** @import { ServerHttp2Stream, OutgoingHttpHeaders } from 'node:http2' */

/**
 * @type {ServerHttp2Stream}
 */
export class MockHttp2Stream extends PassThrough {
	/** @type {OutgoingHttpHeaders} */
	sentHeaders = {}
	headersSent = false

	get pushAllowed() { return false }
	additionalHeaders() { }
	pushStream() { }

	/**
	 * @param {{}} headers
	 */
	respond(headers) {
		this.headersSent = true
		this.sentHeaders = headers
	}
	respondWithFD() { }
	respondWithFile() { }
	get aborted() { return false }

	get bufferSize() { return 1024 }
	get endAfterHeaders() { return false }
	get pending() { return false }
	get rstCode() { return 0 }

	get session() { return undefined }
	get state() { return {} }
	close() {
		console.log('CLOSE requested')
	}

	priority() { }
	setTimeout() { }
	sendTrailers() { }
}
