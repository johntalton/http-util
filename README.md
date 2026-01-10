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

## Response

All responders take in a `stream` as well as a metadata object to hint on servername and origin strings etc.

- `sendError` - 500
- `sendPreflight` - Response to OPTIONS with CORS headers
- `sendUnauthorized` - Unauthorized
- `sendNotFound` - 404
- `sendTooManyRequests` - Rate limit response (429)
- `sendJSON_Encoded` - Standard Ok response with encoding
- `sendSSE` - SSE header (leave the `stream` open)

Responses allow for optional CORS headers as well as Server Timing meta data.

## Body

The `requestBody` method returns a `fetch`-like response.  Including methods `blob`, `arrayBuffer`, `bytes`, `text`, `formData`, `json` as well as a `body` as a `ReadableStream`.

The return is a deferred response that does NOT consume the `steam` until calling one of the above methods.

Optional `byteLimit`, `contentLength` and `contentType` can be provided to hint the parser, as well as a `AbortSignal` to abandoned the reader.