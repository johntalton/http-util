# http-util

Set of utilities to aid in building from-scratch [node:http2](https://nodejs.org/docs/latest/api/http2.html) stream compatible services.

- [Header parsers](#header-parsers)
- [Stream Response methods](#response)
- [Body parser](#body)

## Header Parsers
### From Client:
- Accept Encoding - `parse` and `select` based on server/client values
- Accept Language - `parse` and `select`
- Accept - `parse` and `select`

- Content Type - returns structured data object for use with Body/etc
- Forwarded - `parse` with select-right-most helper
- Multipart - parse into `FormData`
- Content Disposition - for use inside of Multipart
- Conditionals - Etag / FixDate for IfMatch, IfModifiedSince etc

### Server Sent:
- Rate Limit
- Server Timing


```javascript
import {
  Accept,
  MIME_TYPE_JSON,
  MIME_TYPE_TEXT
} from '@johntalton/http-util/headers'

// assuming our path/method/server supports content in json or text
const supportedType = [ MIME_TYPE_JSON, MIME_TYPE_TEXT ]

// from request.header.accept (client prefers json)
const acceptHeader = 'application/json;q=.5, */*;q.4'

const bestMatchingType = Accept.select(acceptHeader, supportedType)
// bestMatchingType === 'application/json'
```

## Response

All responders take in a `stream` as well as a metadata object to hint on servername and origin strings etc.

- [`sendAccepted`](#responseaccepted)
- [`sendConflict`](#responseconflict)
- [`sendContentTooLarge`](#)
- [`sendCreated`](#responsecreated)
- [`sendError`](#responseerror) - 500
- [`sendGone`](#)
- [`sendImATeapot`](#)
- [`sendInsufficientStorage`](#)
- [`sendJSON_Encoded`](#responsejson) - Standard Ok response with encoding
- [`sendMovedPermanently`](#)
- [`sendMultipleChoices`](#)
- [`sendNoContent`](#responsenocontent)
- [`sendNotAcceptable`](#responsenotacceptable)
- [`sendNotAllowed`](#responsenotallowed) - Method not supported / allowed
- [`sendNotFound`](#responsenotfound) - 404
- [`sendNotImplemented`](#responsenotimplemented)
- [`sendNotModified`](#responsenotmodified)
- [`sendPartialContent`](#)
- [`sendPreconditionFailed`](#responsepreconditionfailed)
- [`sendPreflight`](#responsepreflight) - Response to OPTIONS with CORS headers
- [`sendRangeNotSatisfiable`](#)
- [`sendSeeOther`](#)
- [`sendTemporaryRedirect`](#)
- [`sendTimeout`](#responsetimeout)
- [`sendTooManyRequests`](#responsetoomanyrequests) - Rate limit response (429)
- [`sendTrace`](#responsetrace)
- [`sendUnauthorized`](#responseunauthorized) - Unauthorized
- [`sendUnavailable`](#responseunavailable)
- [`sendUnprocessable`](#responseunprocessable)
- [`sendUnsupportedMediaType`](#responseunsupportedmediatype)
- [`sendSSE`](#responsesse) - SSE header (leave the `stream` open)

Responses allow for optional CORS headers as well as Server Timing meta data.

## Response Object

The response methods `sendXYZ` are also wrapped in a `Response` object which can make imports simpler and help organize code.

```js
import { Response } from '@johntalton/http-util/response/object'

// ... sendNotFound becomes .notFound
Response.notFound(stream, meta)
```

## Body

The `requestBody` method returns a `fetch`-like response.  Including methods `blob`, `arrayBuffer`, `bytes`, `text`, `formData`, `json` as well as a `body` as a `ReadableStream`.

The return is a deferred response that does NOT consume the `steam` until calling one of the above methods.

Optional `byteLimit`, `contentLength` and `contentType` can be provided to hint the parser, as well as a `AbortSignal` to abandoned the reader.

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

## Response method API

All response methods take in the `stream` and a `meta` property.

Additional parameters are specific to each return type.

Each return type semantic may also expose header (in addition to the standard headers) to the calling code as needed.

Some common objects can be passed such as `EtagItem`, `CacheControlOptions` and `Metadata` have their own structure.

Many parameters accept `undefined` to skip/ignore the usage

### Response.accepted

Parameters:
- stream
- meta

### Response.conflict

Parameters:
- stream
- meta


### Response.created

Parameters:
- stream
- location
- etag
- meta

Additional Exposed Headers:
- location

### Response.error

Parameters:
- stream
- meta


### Response.json

Parameters:
- stream
- object
- encoding - undefined | 'identity' | 'br' | 'gzip' | 'deflate' | 'zstd'
- etag
- age
- cacheControl
- supportedQueryTypes - undefined | Array of supported query types
- meta

Additional Exposed Headers
- age
- accept-query

### Response.noContent

Parameters:
- stream
- etag
- meta

### Response.notAcceptable

Parameters:
- stream
- supportedTypes
- meta

### Response.notAllowed

Parameters:
- stream
- methods - Array of allowed methods
- meta

Additional Exposed Headers:
- allow

### Response.notFound

Parameters:
- stream
- message
- meta

### Response.notImplemented

Parameters:
- stream
- message
- meta

### Response.notModified

Parameters:
- stream
- etag
- age
- cacheControl
- meta

Additional Exposed Headers:
- age

### Response.preconditionFailed

Parameters:
- stream
- meta

### Response.preflight

Parameters:
- stream
- methods
- supportedQueryTypes - undefined | Array of supported types
- meta

Additional Exposed Headers:
- accept-query

### Response.sse

Parameters:
- stream
- meta


### Response.timeout

Parameters:
- stream
- meta


### Response.tooManyRequests

Parameters:
- stream
- limitInfo - `RateLimitInfo`
- policies - Array of `RateLimitPolicyInfo`
- meta

Additional Exposed Headers:
- retry-after
- rate-limit
- rate-limit-policy

### Response.trace

Parameters:
- stream
- method
- url
- headers
- meta

### Response.unauthorized

Parameters:
- stream
- meta


### Response.unavailable

Parameters:
- stream
- message
- retryAfter
- meta

Additional Exposed Headers:
- retry-after

### Response.unprocessable

Parameters:
- stream
- meta

### Response.unsupportedMediaType

Parameters:
- stream
- acceptableMediaTypes
- supportedQueryTypes
- meta

Additional Exposed Headers:
- accept-query
- accept-post