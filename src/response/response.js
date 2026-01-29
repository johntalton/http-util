import { sendAccepted } from './accepted.js'
import { sendCreated } from './created.js'
import { sendError } from './error.js'
import { sendJSON_Encoded } from './json.js'
import { sendNotAcceptable } from './not-acceptable.js'
import { sendNotAllowed } from './not-allowed.js'
import { sendNotFound } from './not-found.js'
import { sendNotModified } from './not-modified.js'
import { sendPreflight } from './preflight.js'
import { sendSSE } from './sse.js'
import { sendTooManyRequests } from './too-many-requests.js'
import { sendTrace } from './trace.js'
import { sendUnauthorized } from './unauthorized.js'
import { sendUnsupportedMediaType } from './unsupported-media.js'

export const Response = {
	accepted: sendAccepted,
	created: sendCreated,
	error: sendError,
	json: sendJSON_Encoded,
	notAcceptable: sendNotAcceptable,
	notAllowed: sendNotAllowed,
	notFound: sendNotFound,
	notModified: sendNotModified,
	preflight: sendPreflight,
	sse: sendSSE,
	tooManyRequests: sendTooManyRequests,
	trace: sendTrace,
	unauthorized: sendUnauthorized,
	unsupportedMediaType: sendUnsupportedMediaType
}
