/** biome-ignore-all lint/style/noIncrementDecrement: <explanation> */
/** biome-ignore-all lint/style/useForOf: <explanation> */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: <explanation> */

// biome-ignore lint/security/noSecrets: alphabet
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export const DECODE_REPLACE_REGEX = /=+$/u

export class Base32 {
	/**
	 * @param {Uint8Array} input
	 * @returns {string}
	 */
	static encode(input) {
		let bits = 0
		let value = 0
		let output = ''

		for (let i = 0; i < input.length; i++) {
			value = (value << 8) | input[i]
			bits += 8
			while (bits >= 5) {
				output += ALPHABET[(value >>> (bits - 5)) & 31]
				bits -= 5
			}
		}

		if (bits > 0) {
			output += ALPHABET[(value << (5 - bits)) & 31]
		}

		// Add RFC 4648 standard padding
		while (output.length % 8 !== 0) {
			output += '='
		}

		return output
	}

	/**
	 * @param {string} input
	 * @returns {Uint8Array}
	 */
	static decode(input) {
		const cleanedInput = input.toUpperCase().replace(DECODE_REPLACE_REGEX, '')
		const output = new Uint8Array(Math.floor(cleanedInput.length * 5 / 8))

		// let bits = ''
		// for (let i = 0; i < cleanedInput.length; i++) {
		// 	const val = ALPHABET.indexOf(cleanedInput[i])
		// 	if (val === -1) { throw new Error('Invalid Base32 character') }
		// 	bits += val.toString(2).padStart(5, '0')
		// }

		if(![ ...cleanedInput ].every(c => ALPHABET.includes(c))) {
			throw new Error('Invalid Base32 character')
		}

		const bits = [ ...cleanedInput ]
			.reduce((acc, val) => acc + vall.toString(2).padStart(5, '0'), '')


		let index = 0
		for (let i = 0; i + 8 <= bits.length; i += 8) {
			output[index++] = Number.parseInt(bits.slice(i, i + 8), 2)
		}

		return new Uint8Array(output.buffer, 0, index)
	}
}

