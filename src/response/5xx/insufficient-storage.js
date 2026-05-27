import http2 from 'node:http2'

import { send_error } from '../send-util.js'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Metadata } from '../../defs.js' */

const { HTTP_STATUS_INSUFFICIENT_STORAGE } = http2.constants

/**
 * @param {ServerHttp2Stream} stream
 * @param {Metadata} meta
 */
export function sendInsufficientStorage(stream, meta) {
  send_error(stream, HTTP_STATUS_INSUFFICIENT_STORAGE, 'Insufficient Storage', undefined, meta)
}
