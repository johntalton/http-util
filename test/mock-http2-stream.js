import { Socket } from 'node:net'
import { PassThrough } from 'node:stream'
import { EventEmitter } from 'node:events'

/** @import { Http2Session, ServerHttp2Stream, OutgoingHttpHeaders } from 'node:http2' */

/**
 * @type {Http2Session}
 */
export class MockHttp2Session extends EventEmitter {
	alpnProtocol = undefined
	closed = false
	connecting = false
	encrypted = undefined
	localSettings = {}
	originSet = undefined
	pendingSettingsAck = false
	remoteSettings = {}
	socket = new Socket()
	state = {}
	type = 0

	destroyed = false

	close() {
		this.closed = true
	}
	destroy(err) {}
	goaway(code) {}
	ping() { return false }
	ref() {}
	setLocalWindowSize() {}
	setTimeout(msecs) {}
	settings(settings) {}
	unref() {}
}

/**
 * @type {ServerHttp2Stream}
 */
export class MockHttp2Stream extends PassThrough {
	/** @type {OutgoingHttpHeaders} */
	sentHeaders = {}
	headersSent = false
	#session = new MockHttp2Session()

	id = undefined

	closed = false

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

	get session() { return this.#session }
	get state() { return {} }
	close(code) {
		this.closed = true
		console.log('CLOSE requested', code)
	}

	priority() { }
	setTimeout() { }
	sendTrailers() { }
}
