## User Management API

Base path:
`<host>/api/user`

All endpoints currently return **plain text** responses, but are expected to be migrated to JSON in the future.

---

### POST `/api/user/register`

Create a new non-developer user.

#### Description

Creates a new user with one of the roles:

* `"STUDENT"`
* `"PROFESSOR"`
* `"UNIVERSITY_ADMIN"`

> **Note:** `"DEVELOPER"` is **not allowed** for this endpoint.

Only users with role `UNIVERSITY_ADMIN` can call this endpoint.

#### Request

* **Method:** `POST`

* **URL:** `<host>/api/user/register`

* **Headers:**

  * `Content-Type: application/json`
  * `Authorization: Bearer <accessToken>`
    (access token must belong to a user with role `UNIVERSITY_ADMIN` or `DEVELOPER`)

* **Body (JSON):**

  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "STUDENT"
  }
  ```

| Field      | Type   | Required | Constraints                                                               |
| ---------- | ------ | -------- | ------------------------------------------------------------------------- |
| `email`    | string | yes      | Must be unique.                                                           |
| `password` | string | yes      | No special requirements (any non-empty string your frontend allows).      |
| `role`     | string | yes      | Must be exactly one of: `"STUDENT"`, `"PROFESSOR"`, `"UNIVERSITY_ADMIN"`. |

#### Successful Response

* **Status:** `200 OK`
* **Content-Type:** `text/plain`
* **Body:**

  ```text
  Successfully created user
  ```

(No JSON body, no cookies, no headers beyond defaults.)

#### Error Responses

* **`403 Forbidden`**

  * Caller does not have `UNIVERSITY_ADMIN` role.
  * Or role in the request is invalid (e.g., `"DEVELOPER"` or anything not in the allowed set).
  * Or email is already in use (depending on how your service maps that exception).


#### Example (cURL)

```bash
curl -X POST "<host>/api/user/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

---

### POST `/api/user/register-developer`

Create a new developer user (internal use).

#### Description

Creates a new user with role **`DEVELOPER`**.
This endpoint is intended for **internal usage only**.

Only users with role `DEVELOPER` can call this endpoint.

#### Request

* **Method:** `POST`

* **URL:** `<host>/api/user/register-developer`

* **Headers:**

  * `Content-Type: application/json`
  * `Authorization: Bearer <accessToken>`
    (access token must belong to a user with role `DEVELOPER`)

* **Body (JSON):**

  ```json
  {
    "email": "dev@example.com",
    "password": "password123"
  }
  ```

> The controller uses `RegisterRequest` but only `email` and `password` are actually used.
> Role is fixed internally to `"DEVELOPER"`.

| Field      | Type   | Required | Constraints       |
| ---------- | ------ | -------- | ----------------- |
| `email`    | string | yes      | Must be unique.   |
| `password` | string | yes      | No special rules. |

#### Successful Response

* **Status:** `200 OK`
* **Content-Type:** `text/plain`
* **Body:**

  ```text
  Successfully created developer user
  ```

#### Error Responses

* **`403 Forbidden`**

  * Caller does not have `DEVELOPER` role.
  * Or email is already in use (depending on service behavior).

#### Example (cURL)

```bash
curl -X POST "<host>/api/user/register-developer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "email": "dev@example.com",
    "password": "password123"
  }'
```

