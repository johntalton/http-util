| name                      | 2xx | 3xx | 4xx | 5xx |
|---------------------------|-----|-----|-----|-----|
| trace                     | 200 |     |     |     |
| preflight                 | 200 |     |     |     |
| json                      | 200 |     |     |     |
| sse                       | 200 |     |     |     |
| created                   | 201 |     |     |     |
| accepted                  | 202 |     |     |     |
| no-content                | 204 |     |     |     |
| *partial-content*         | 206 |     |     |     |
| *multiple-choices*        |     | 300 |     |     |
| moved-permanently         |     | 301 |     |     |
| see-other                 |     | 303 |     |     |
| not-modified              |     | 304 |     |     |
| temporary-redirect        |     | 307 |     |     |
| unauthorized              |     |     | 401 |     |
| not-found                 |     |     | 404 |     |
| not-allowed               |     |     | 405 |     |
| not-acceptable            |     |     | 406 |     |
| timeout                   |     |     | 408 |     |
| conflict                  |     |     | 409 |     |
| gone                      |     |     | 410 |     |
| precondition-failed       |     |     | 412 |     |
| content-too-large         |     |     | 413 |     |
| unsupported-media         |     |     | 415 |     |
| *range-not-satisfiable*   |     |     | 416 |     |
| im-a-teapot               |     |     | 418 |     |
| unprocessable             |     |     | 422 |     |
| too-many-requests         |     |     | 429 |     |
| error                     |     |     |     | 500 |
| not-implemented           |     |     |     | 501 |
| unavailable               |     |     |     | 503 |
| insufficient-storage      |     |     |     | 507 |

