# http-util

Set of utilities to aid in building from-scratch [node:http2](https://nodejs.org/docs/latest/api/http2.html) stream compatible services.

- Header parsers
- Stream Response methods
- Body parser

## Header Parsers
### From Client:
- Accept Encoding - `parse` and `select` based on server/client values
- Accept Language - `parse` and `select`
- Accept - `parse` and `select`

- Content Type - returns structured data object for use with Body/etc
- Forwarded - `parse` with select-right-most helper
- Multipart - parse into `FormData`
- Content Disposition - for use inside of Multipart

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

- `sendAccepted`
- `sendConflict`
- `sendCreated`
- `sendError` - 500
- `sendJSON_Encoded` - Standard Ok response with encoding
- `sendNoContent`
- `sendNotAcceptable`
- `sendNotAllowed` - Method not supported / allowed
- `sendNotFound` - 404
- `sendNotModified`
- `sendPreflight` - Response to OPTIONS with CORS headers
- `sendTimeout`
- `sendTooManyRequests` - Rate limit response (429)
- `sendTrace`
- `sendUnauthorized` - Unauthorized
- `sendUnprocessable`
- `sendUnsupportedMediaType`
- `sendSSE` - SSE header (leave the `stream` open)

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
