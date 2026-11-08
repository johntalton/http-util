import { HTTP_STATUS_VARIANT_ALSO_NEGOTIATES } from '../../status.js'
import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { SendContext, Metadata } from '../../defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {SendContext} context
 * @param {Metadata} meta
 */
export function sendVariantAlsoNegotiates(stream, context, meta) {
	const message = undefined
	const retryAfter = undefined
	send_error(stream, HTTP_STATUS_VARIANT_ALSO_NEGOTIATES, message, retryAfter, context, meta)
}

// TCN: list
// Vary: negotiate,accept-language
// Alternates: {"index.html.en" 1 {type text/html} {language en} {length 48}}, {"another-map.html.fr.map" 1 {type text/html} {language fr} {length 45}}}}

