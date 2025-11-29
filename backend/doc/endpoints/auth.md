## Auth API

Base path:
`<host>/api/auth`

All endpoints accept and return JSON (unless otherwise specified).

---

### POST `/api/auth/login`

Authenticate a user with email and password.

#### Request

* **Method:** `POST`

* **URL:** `<host>/api/auth/login`

* **Headers:**

  * `Content-Type: application/json`

* **Body (JSON):**

  ```json
  {
    "email": "user@example.com",
    "password": "plain-text-password"
  }
  ```

| Field      | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| `email`    | string | yes      | User’s email.    |
| `password` | string | yes      | User’s password. |

#### Successful Response

* **Status:** `200 OK`

* **Body (JSON):**

  ```json
  {
    "accessToken": "jwt-access-token-here"
  }
  ```

* **Cookies set:**

  * `refreshToken`

    * `HttpOnly`: `true`
    * `Secure`: `true`
    * `SameSite`: `Lax`
    * (Path, Max-Age, Domain: depends on your server config)

This cookie is meant to be stored by the browser and used for refreshing the access token.

#### Error Responses (examples)

* `403 Forbidden`

#### Example (cURL)

```bash
curl -X POST "<host>/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -i
```

---

### POST `/api/auth/refresh`

Obtain a new access token using the `refreshToken` cookie.


#### Request

* **Method:** `POST`

* **URL:** `<host>/api/auth/refresh`

* **Headers:**

  * `Content-Type: application/json`

* **Cookies (required):**

  * `refreshToken`: The refresh token previously issued by `POST /api/auth/login`.

* **Body:**

  Empty

  ```json
  {}
  ```

#### Successful Response

* **Status:** `200 OK`

* **Body (JSON)**:

  ```json
  {
    "accessToken": "new-jwt-access-token-here"
  }
  ```

* **Cookies set:**

  * `refreshToken`

    * Rotated (new value).
    * Attributes:

      * `HttpOnly`: `true`
      * `Secure`: `true`
      * `SameSite`: `Lax`

#### Error Responses (examples)

* `403 Forbidden`

#### Example (cURL)

```bash
curl -X POST "<host>/api/auth/refresh" \
  -H "Content-Type: application/json" \
  --cookie "refreshToken=<user-refresh-token>" \
  -d '{}' \
  -i
```
