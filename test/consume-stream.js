import { Readable, pipeline } from 'node:stream'
import { ReadableStream } from 'node:stream/web'

/**
 * @param {Readable | ReadableStream} stream
 */
export async function consumeStreamAsText(stream) {
	const streamDecoder = new TextDecoderStream('utf-8', {})
	pipeline(
		stream,
		streamDecoder.writable,
		err => {
			if (err) {
				console.log('Error consuming stream as text')
			}
		}
	)

	const strBuffer = []
	for await (const str of streamDecoder.readable) {
		strBuffer.push(str)
	}
	return strBuffer.join('')
}
