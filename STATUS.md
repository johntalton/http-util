| name                      | 2xx | 3xx | 4xx | 5xx |
|---------------------------|-----|-----|-----|-----|
| trace                     | 200 |     |     |     |
| preflight                 | 200 |     |     |     |
| json                      | 200 |     |     |     |
| bytes                     | 200 |     |     |     |
| sse                       | 200 |     |     |     |
| created                   | 201 |     |     |     |
| accepted                  | 202 |     |     |     |
| ~~non-authoritative~~     | 203 |     |     |     |
| no-content                | 204 |     |     |     |
| ~~reset-content~~         | 205 |     |     |     |
| partial-content           | 206 |     |     |     |
| **multiple-choices**      |     | 300 |     |     |
| moved-permanently         |     | 301 |     |     |
| ~~found~~                 |     | 302 |     |     |
| see-other                 |     | 303 |     |     |
| not-modified              |     | 304 |     |     |
||| 305 |||
||| 306 |||
| temporary-redirect        |     | 307 |     |     |
| **permanent-redirect**    |     | 308 |     |     |
| ~~bad-request~~           |     |     | 400 |     |
| unauthorized              |     |     | 401 |     |
| ~~payment-required~~      |     |     | 402 |     |
| **forbidden**             |     |     | 403 |     |
| not-found                 |     |     | 404 |     |
| not-allowed               |     |     | 405 |     |
| not-acceptable            |     |     | 406 |     |
| ~~proxy-authentication-required~~   ||| 407 |     |
| timeout                   |     |     | 408 |     |
| conflict                  |     |     | 409 |     |
| gone                      |     |     | 410 |     |
| ~~length-required~~       |     |     | 411 |     |
| precondition-failed       |     |     | 412 |     |
| content-too-large         |     |     | 413 |     |
| ~~url-too-long~~          |     |     | 414 |     |
| unsupported-media         |     |     | 415 |     |
| range-not-satisfiable     |     |     | 416 |     |
| ~~expectation-failed~~    |     |     | 417 |     |
| im-a-teapot               |     |     | 418 |     |
|||| 419 ||
|||| 420 ||
| ~~misdirected-request~~   |     |     | 421 |     |
| unprocessable             |     |     | 422 |     |
| ~~locked~~                |     |     | 423 |     |
| ~~failed-dependency~~     |     |     | 424 |     |
| ~~too-early~~             |     |     | 425 |     |
| ~~upgrade-required~~      |     |     | 426 |     |
|||| 427 ||
| precondition-failed       |     |     | 428 |     |
| too-many-requests         |     |     | 429 |     |
|||| 430 ||
| ~~request-header-filed-too-larger~~ ||| 431 |     |
| ~~unavailable-for-legal-reasons~~   ||| 451 |     |
| error                     |     |     |     | 500 |
| not-implemented           |     |     |     | 501 |
| ~~bad-gateway~~           |     |     |     | 502 |
| unavailable               |     |     |     | 503 |
| ~~gateway-timeout~~       |     |     |     | 504 |
| ~~http-version-not-supported~~ ||     |     | 505 |
| ~~variant-also-negotiates~~    ||     |     | 506 |
| insufficient-storage      |     |     |     | 507 |
| ~~loop-detected~~         |     |     |     | 508 |
||||| 509 |
| ~~not-extended~~          |     |     |     | 510 |
| ~~network-authentication-required~~ |||     | 511 |

