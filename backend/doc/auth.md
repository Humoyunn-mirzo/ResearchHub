
# Tokens used/unused

## ✅ 1. Access Token (JWT)

### Purpose:

* Sent with every request, by the client (`Authorization: Bearer <token>`)
* Contains:

  * user id
  * roles
  * expiration (usually 5–15 minutes)

### Properties:

* **Short-lived**
* **Self-contained** (backend doesn’t store it)
* Can be revoked by rotating signing key or using token blacklist (optional)

### How you store it:

Depends on frontend:
* **Memory (React state)** (more secure, lost on refresh)
* OR **LocalStorage** (simple, but XSS-risk if your app is compromised)

---
## ✅ 2. Refresh Token

### Why needed?

Because access tokens expire quickly, users would be logged out constantly.

### Properties:

* **Long-lived** (30-60 days)
* Stored server-side to check for validity
* AND Client-side as HttpOnly, Secure, SameSite=strict cookie
* Used only on `POST /auth/refresh`

### Security requirements:

* Must be **stored safely**
* Must be **revokable** (stored in DB or cache)
* Rotated on every refresh (refresh token rotation)

---

## ❌ 3. CSRF token

CSRF is required ONLY when cookies are used for authentication

In this application, JWT is used, and passed through the `Authorization: Bearer <Token>` header property

---

## ❌ 4. Session tokens

JWT is used instead of session tokens, they serve a similar purpose

---


# Workflow


## 🔐 Login

Frontend calls:

```
POST /auth/login
{
  "email": "...",
  "password": "..."
}
```

Backend returns:

```
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## 🔄 Refresh token

Frontend calls:

```
POST /auth/refresh
{
  "refreshToken": "..."
}
```

Backend:

* validates refresh token
* returns new JWT + new refresh token

---

## 🚪 Logout

Refresh token is deleted from DB.

---

## 🔒 Protected requests

Frontend sends:

```
Authorization: Bearer <access token>
```

Backend allows/denies based on roles inside JWT.
