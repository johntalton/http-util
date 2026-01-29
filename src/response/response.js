import { sendAccepted } from './accepted.js'
import { sendConflict } from './conflict.js'
import { sendCreated } from './created.js'
import { sendError } from './error.js'
import { sendJSON_Encoded } from './json.js'
import { sendNoContent } from './no-content.js'
import { sendNotAcceptable } from './not-acceptable.js'
import { sendNotAllowed } from './not-allowed.js'
import { sendNotFound } from './not-found.js'
import { sendNotModified } from './not-modified.js'
import { sendPreflight } from './preflight.js'
import { sendSSE } from './sse.js'
import { sendTimeout } from './timeout.js'
import { sendTooManyRequests } from './too-many-requests.js'
import { sendTrace } from './trace.js'
import { sendUnauthorized } from './unauthorized.js'
import { sendUnsupportedMediaType } from './unsupported-media.js'
import { sendUnprocessable } from './unprocessable.js'

export const Response = {
	accepted: sendAccepted,
	conflict: sendConflict,
	created: sendCreated,
	error: sendError,
	noContent: sendNoContent,
	json: sendJSON_Encoded,
	notAcceptable: sendNotAcceptable,
	notAllowed: sendNotAllowed,
	notFound: sendNotFound,
	notModified: sendNotModified,
	preflight: sendPreflight,
	sse: sendSSE,
	timeout: sendTimeout,
	tooManyRequests: sendTooManyRequests,
	trace: sendTrace,
	unauthorized: sendUnauthorized,
	unsupportedMediaType: sendUnsupportedMediaType,
	unprocessable: sendUnprocessable
}
