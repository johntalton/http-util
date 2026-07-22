# http-util

[![npm Version](http://img.shields.io/npm/v/@johntalton/http-util.svg)](https://www.npmjs.com/package/@johntalton/http-util)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/http-util)
[![CI](https://github.com/johntalton/http-util/actions/workflows/CI.yml/badge.svg)](https://github.com/johntalton/http-util/actions/workflows/CI.yml)


Set of utilities to aid in building from-scratch [node:http2](https://nodejs.org/docs/latest/api/http2.html) stream compatible services.

A comprehensive server framework that uses this library can be found at [http-core](https://github.com/johntalton/http-core).

A full range of header parsing and encoding, as well are response stream methods.  A deferred `body` reader (akin to fetch api) is provided.

- [Header](#header-parsers--encoders)
- [Response](#response)
- [Body parser](#body)

## Header Parsers / Encoders

A wide range of supported header are available.  For incoming header (from client) `parse` methods exist, For outgoing header (sent from server) the `encode` method is used.

Many header require common handling (aka. select from accept-encoding list) in such cases extra methods are provided to accomplish these tasks.

The common Structured Fields are also supported via [StructuredField](./src/headers/structured-field/README.md) `parse` and `encode` methods.

| Header | parse | encode | extras
|--------|-------|--------|--------
| accept                        | ✅ |   | compare, select |
| accept-encoding               | ✅ |   | select |
| accept-language               | ✅ |   | select |
| access-control-request-method | ✅ |   ||
| access-control-request-header | ✅ |   ||
| cache-control                 |   | ✅ ||
| clear-site-data               |   | ✅ ||
| client-hints                  |   | ✅ ||
| conditional (etag)            | ✅ | ✅ | has, hayAny, weak, strong |
| conditional {lastModified}    | ✅ | ✅ | toDate, toInstant, isAfter |
| content-disposition           | ✅ | ✅ ||
| content-range                 |    | ✅ ||
| content-security-policy       |   | ✅ ||
| content-type                  | ✅    ||
| cross-origin-embedder-policy  |   | ✅ ||
| cross-origin-opener-policy    |   | ✅ ||
| cross-origin-resource-policy  |   | ✅ ||
| deprecation                   |   | ✅ ||
| sec-fetch-*                   | ✅ |   ||
| forwarded                     | ✅ |   | select |
| integrity-policy              |   | ✅ ||
| link                          |   | ✅ ||
| permissions-policy            |   | ✅ ||
| preference / applied          | ✅ | ✅ ||
| range                         | ✅ |   | normalize |
| rate-limit / policy           |   | ✅ ||
| referrer-policy               |   | ✅ ||
| reporting-endpoints           |   | ✅ ||
| server-timing                 |   | ✅ ||
| strict-transport-security     |   | ✅ ||
| sunset                        |   | ✅ ||
| www-authenticate              |   | ✅ | basic, bearer |
| x-content-type-options        |   | ✅ ||
| x-xss-protection              |   | ✅ ||




## Example Accept Header

Using the `selectItemFrom` function to perform server-side content-negotiation (aka, select from server supported types given client accept types).

```javascript
import {
  Accept,
  MIME_TYPE_JSON,
  MIME_TYPE_TEXT
} from '@johntalton/http-util/headers'

// assuming our service supports content in JSON or TEXT
const supportedType = [ MIME_TYPE_JSON, MIME_TYPE_TEXT ]

// from request.header.accept (client prefers JSON)
const acceptHeader = 'application/json;q=.5, */*;q.4'

const acceptItems = Accept.parse(acceptHeader)
const matchItem = Accept.selectItemFrom(acceptItems, supportedType)
// returned matchItem will be undefined if no valid match
//   otherwise it will contain the full users AcceptItem
//   (AcceptItem will be resolved if mimetype any is encountered)

// matchItem.mimetype === 'application/json'
// generate a JSON response (Response.json(...))
```

## Response

Response class contain a full list of response function that represent their HTTP status codes.

Each functions first parameter is the response `stream`, they all also take in a `context` and `meta`.

Each function takes a specific set of parameters that are related to the status code grammar.  This help create consistency across responses.

- 2xx
  - [`Accepted`](#)
  - [`Created`](#)
  - [`NoContent`](#)
  - [`Bytes`](#) - access to response with raw bytes (un-encoded)
  - [`Encoded`](#) - access to response with encoded byte stream
  - [`JSON`](#) - response with JSON object (auto encoded)
  - [`Preflight`](#) - Response to OPTIONS with CORS headers
  - [`SSE`](#) - SSE header (leave the `stream` open)
  - [`Trace`](#)
  - [`PartialContent`](#) - with `Multipart` content
  - [`ResetContent`](#)

- 3xx
  - [`Found`](#)
  - [`MovedPermanently`](#)
  - [`MultipleChoices`](#)
  - [`NotModified`](#)
  - [`PermanentRedirect`](#)
  - [`SeeOther`](#)
  - [`TemporaryRedirect`](#)

- 4xx
  - [`BadRequest`](#)
  - [`Conflict`](#)
  - [`ContentTooLarge`](#)
  - [`Forbidden`](#)
  - [`Gone`](#)
  - [`ImATeapot`](#)
  - [`NotAcceptable`](#)
  - [`NotAllowed`](#) - Method not supported / allowed
  - [`NotFound`](#) - 404
  - [`PaymentRequired`](#)
  - [`PreconditionFailed`](#)
  - [`PreconditionRequired`](#)
  - [`RangeNotSatisfiable`](#)
  - [`Timeout`](#)
  - [`TooManyRequests`](#) - Rate limit response (429)
  - [`Unauthorized`](#) - Unauthorized
  - [`Unprocessable`](#)
  - [`UnsupportedMediaType`](#)

- 5xx
  - [`Error`](#) - 500
  - [`InsufficientStorage`](#)
  - [`NotImplemented`](#)
  - [`Unavailable`](#)
  - [`VariantAlsoNegotiates`](#)

## Example Response

```js
import { Response } from '@johntalton/http-util/response/object'

//
Response.notFound(stream, meta)
```

Alternatively, calling function style exists, and is identical.

```js
import { Response } from '@johntalton/http-util/response'

//
sendNotFound(stream, meta)
```


## Body

The `requestBody` method returns a `fetch`-like response.  Including methods `blob`, `arrayBuffer`, `bytes`, `text`, `formData`, `json` as well as a `body` as a `ReadableStream`.

The return is a deferred response that does NOT consume the `steam` until calling one of the above methods.

Optional `byteLimit`, `contentLength` and `contentType` can be provided to hint the parser, as well as a `AbortSignal` to abandoned the reader.

`Multipart` class is used when accessing `formData`.

```js
import { requestBody } from '@johntalton/http-util/body'

const signal = // from someplace like a timeout for the overall request

// limit time and size for the body
// note: this does not consume the stream
const futureBody = requestBody(stream, {
  byteLimit: 1000 * 1000,
  signal
})

// ... a few moments later ...

// consume the stream
const body = futureBody.json()

```

