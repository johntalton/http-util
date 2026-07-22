# Structured Field

Structured Fields (Header / Trailers) are intended as a way to standardize HTT Header/Trailers format.

This library provides [RFC 9651](https://www.rfc-editor.org/info/rfc9651) compliant `parser` and `serializer`.

This passes all tests from the [test suite](https://github.com/httpwg/structured-field-tests)

## Example

The following example parsed a `"dictionary"` withe the keys `foo` and `bar`. Where `foo` has an implicit value (`true`) and an additional parameter of `a` set to `false`.  The key `bar` has the =inner-list of `42, 77`.

```js
import { StructuredField } from '@johntalton/http-util/structured-field'

const result = StructuredField.parse('foo;a=?0, bar=(42 77)', 'dictionary')
// Map(2) {
//   'foo' => { value: true, parameters: Map(1) { 'a' => false } },
//   'bar' => { inner_list: [ [Object], [Object] ], parameters: Map(0) {} }
// }

```

Serialization (or encoding) of data into a string can be done using the `Native Format` and makes use of javascript data types, though these can be defined loosely and overridden with `type` hints.

`encode` will use the data type of the top-level item to define the serialization structure (aka, `Map` will create a `"dictionary"`, `Array` is a `"list"`).

This example encodes a list of number, with the second having a parameter with a token value

```js
import { StructuredField } from '@johntalton/http-util/structured-field'

const result = StructuredField.encode([
	{ value: 42 },
	{ value: 77, parameters: new Map([[ 'foo', Symbol.for('bar') ]]) }
])

// 42, 77;foo=bar

```

Note the use of `symbol` to generate `Token` types, this is equivilant to the "hinted" value `{ value: 'bar', type: 'token' }`

Note that if the value of the parameter `foo` would have been `'bar'` (a string) it would have been generated as `42, 77;foo="bar"` (note the double-quotes around the value)



## Data Types

Structured Fields has a rich data capability that allows for a wide range of expressions.

The primary concept that lead to this is the fact that all "items" can have Parameters associated with them, that includes inner-lists and the items of the inner-list.

This library utilized native javascript object (`Map`, `Array` etc) to represent those values.

For other "primitive" items, an object in the form `{ value, parameters }` is constructed.

Further, `Temporal.Instant` and `Date` are valid for working with the `"date"` type, and a specialized `"displaystring"` class `DisplayString` is used for UTF Encoded data.

Lastly, javascript does not have a concept of the difference between `1` and `1.0`.  Thus when using these values, special care must be take, specifically when encoding/serializing data (recall a `type` hint can be added to values)


## Output Formatting

The `parse` function take a `options` parameter that can control the output format.

This `NativeFormatter` is used if none is provided.

The `HTTPWGTestFormatter` is provided to satisfy Unit Testing the [common test suite](https://github.com/httpwg/structured-field-tests).  It heavily used Array-of-Arrays (aka tuples) for representing the data.  While this can be useful, it isn't human/developer friendly.

```js
import { StructuredField, HTTPWGTestFormatter } from '@johntalton/http-util/structured-field'

const result = StructuredField.parse('foo;a=?0, bar=(42 77)', 'dictionary', {
	format: HTTPWGTestFormatter
})
// [ [ 'foo', [ true, [Array] ] ], [ 'bar', [ [Array], [] ] ] ]
```
