import { sendAccepted } from './accepted.js'
import { sendBytes } from './bytes.js'
import { sendConflict } from './conflict.js'
import { sendContentTooLarge } from './content-too-large.js'
import { sendCreated } from './created.js'
import { sendError } from './error.js'
import { sendForbidden } from './forbidden.js'
import { sendGone } from './gone.js'
import { sendImATeapot } from './im-a-teapot.js'
import { sendInsufficientStorage } from './insufficient-storage.js'
import { sendJSON_Encoded } from './json.js'
import { sendMovedPermanently } from './moved-permanently.js'
import { sendMultipleChoices } from './multiple-choices.js'
import { sendNoContent } from './no-content.js'
import { sendNotAcceptable } from './not-acceptable.js'
import { sendNotAllowed } from './not-allowed.js'
import { sendNotFound } from './not-found.js'
import { sendNotImplemented } from './not-implemented.js'
import { sendNotModified } from './not-modified.js'
import { sendPartialContent } from './partial-content.js'
import { sendPermanentRedirect } from './permanent-redirect.js'
import { sendPreconditionFailed } from './precondition-failed.js'
import { sendPreflight } from './preflight.js'
import { sendRangeNotSatisfiable } from './range-not-satisfiable.js'
import { sendSeeOther } from './see-other.js'
import { sendSSE } from './sse.js'
import { sendTemporaryRedirect } from './temporary-redirect.js'
import { sendTimeout } from './timeout.js'
import { sendTooManyRequests } from './too-many-requests.js'
import { sendTrace } from './trace.js'
import { sendUnauthorized } from './unauthorized.js'
import { sendUnavailable } from './unavailable.js'
import { sendUnprocessable } from './unprocessable.js'
import { sendUnsupportedMediaType } from './unsupported-media.js'

export const Response = {
	accepted: sendAccepted,
	bytes: sendBytes,
	conflict: sendConflict,
	contentTooLarge: sendContentTooLarge,
	created: sendCreated,
	error: sendError,
	forbidden: sendForbidden,
	gone: sendGone,
	imATeapot: sendImATeapot,
	insufficientStorage: sendInsufficientStorage,
	json: sendJSON_Encoded,
	movedPermanently: sendMovedPermanently,
	multipleChoices: sendMultipleChoices,
	noContent: sendNoContent,
	notAcceptable: sendNotAcceptable,
	notAllowed: sendNotAllowed,
	notFound: sendNotFound,
	notImplemented: sendNotImplemented,
	notModified: sendNotModified,
	partialContent: sendPartialContent,
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
