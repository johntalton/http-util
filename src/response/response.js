import { sendAccepted } from './2xx/accepted.js'
import { sendBytes } from './2xx/bytes.js'
import { sendCreated } from './2xx/created.js'
import { sendJSON } from './2xx/json.js'
import { sendNoContent } from './2xx/no-content.js'
import { sendPartialContent } from './2xx/partial-content.js'
import { sendPreflight } from './2xx/preflight.js'
import { sendSSE } from './2xx/sse.js'
import { sendTrace } from './2xx/trace.js'
import { sendFound } from './3xx/found.js'
import { sendMovedPermanently } from './3xx/moved-permanently.js'
import { sendMultipleChoices } from './3xx/multiple-choices.js'
import { sendNotModified } from './3xx/not-modified.js'
import { sendPermanentRedirect } from './3xx/permanent-redirect.js'
import { sendSeeOther } from './3xx/see-other.js'
import { sendTemporaryRedirect } from './3xx/temporary-redirect.js'
import { sendBadRequest } from './4xx/bad-request.js'
import { sendConflict } from './4xx/conflict.js'
import { sendContentTooLarge } from './4xx/content-too-large.js'
import { sendForbidden } from './4xx/forbidden.js'
import { sendGone } from './4xx/gone.js'
import { sendImATeapot } from './4xx/im-a-teapot.js'
import { sendNotAcceptable } from './4xx/not-acceptable.js'
import { sendNotAllowed } from './4xx/not-allowed.js'
import { sendNotFound } from './4xx/not-found.js'
import { sendPaymentRequired } from './4xx/payment-required.js'
import { sendPreconditionFailed } from './4xx/precondition-failed.js'
import { sendRangeNotSatisfiable } from './4xx/range-not-satisfiable.js'
import { sendTimeout } from './4xx/timeout.js'
import { sendTooManyRequests } from './4xx/too-many-requests.js'
import { sendUnauthorized } from './4xx/unauthorized.js'
import { sendUnprocessable } from './4xx/unprocessable.js'
import { sendUnsupportedMediaType } from './4xx/unsupported-media.js'
import { sendError } from './5xx/error.js'
import { sendInsufficientStorage } from './5xx/insufficient-storage.js'
import { sendNotImplemented } from './5xx/not-implemented.js'
import { sendUnavailable } from './5xx/unavailable.js'

export const Response = {
	accepted: sendAccepted,
	badRequest: sendBadRequest,
	bytes: sendBytes,
	conflict: sendConflict,
	contentTooLarge: sendContentTooLarge,
	created: sendCreated,
	error: sendError,
	forbidden: sendForbidden,
	found: sendFound,
	gone: sendGone,
	imATeapot: sendImATeapot,
	insufficientStorage: sendInsufficientStorage,
	json: sendJSON,
	movedPermanently: sendMovedPermanently,
	multipleChoices: sendMultipleChoices,
	noContent: sendNoContent,
	notAcceptable: sendNotAcceptable,
	notAllowed: sendNotAllowed,
	notFound: sendNotFound,
	notImplemented: sendNotImplemented,
	notModified: sendNotModified,
	partialContent: sendPartialContent,
	paymentRequired: sendPaymentRequired,
	permanentRedirect: sendPermanentRedirect,
	preconditionFailed: sendPreconditionFailed,
	preflight: sendPreflight,
	rangeNotSatisfiable: sendRangeNotSatisfiable,
	seeOther: sendSeeOther,
	sse: sendSSE,
	temporaryRedirect: sendTemporaryRedirect,
	timeout: sendTimeout,
	tooManyRequests: sendTooManyRequests,
	trace: sendTrace,
	unauthorized: sendUnauthorized,
	unavailable: sendUnavailable,
	unprocessable: sendUnprocessable,
	unsupportedMediaType: sendUnsupportedMediaType
}
