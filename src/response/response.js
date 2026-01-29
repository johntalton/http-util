import { sendError } from './error.js'
import { sendJSON_Encoded } from './json.js'
import { sendNotAllowed } from './not-allowed.js'
import { sendNotFound } from './not-found.js'
import { sendPreflight } from './preflight.js'
import { sendSSE } from './sse.js'
import { sendTooManyRequests } from './too-many-requests.js'
import { sendTrace } from './trace.js'
import { sendUnauthorized } from './unauthorized.js'

export const Response = {
	error: sendError,
	json: sendJSON_Encoded,
	notAllowed: sendNotAllowed,
	notFound: sendNotFound,
	preflight: sendPreflight,
	sse: sendSSE,
	tooManyRequests: sendTooManyRequests,
	trace: sendTrace,
	unauthorized: sendUnauthorized
}
