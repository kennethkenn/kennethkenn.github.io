---
layout: post
title: "Securing REST APIs: JWTs and OAuth2 Explained"
date: 2025-07-30
categories: [Backend, Security]
description: "Understanding stateless authentication mechanisms for modern web applications."
tags: [security, jwt, oauth2, rest-api, authentication]
---

In the age of SPAs (Single Page Applications) and Mobile Apps, the traditional cookie-based session is dying. We need **Stateless Authentication**. Enter JWT (JSON Web Tokens).

## Structure of a JWT

A JWT is just a base64 encoded string with three parts: `Header.Payload.Signature`.

1.  **Header**: Mentions the algorithm (usually HS256).
2.  **Payload**: User data. `{"sub": "123", "role": "admin", "exp": 1234567890}`.
3.  **Signature**: Using a secret key on the server, we sign the Header+Payload.

The client gets this token on Login and sends it in the `Authorization` header for every subsequent request. The server verifies the signature. If it matches, we know the user is who they say they are—without looking up a session in the database.

## OAuth2: The Specialized Handshake

OAuth2 is a protocol, not just a token format. It allows a user to grant a third-party application access to their resources without giving away their password.

### The Flow (Authorization Code Grant)

1.  **User clicks "Login with Google"**.
2.  **Redirect**: Your app redirects the browser to Google's auth server.
3.  **Consent**: User types password on Google.com and approves your app.
4.  **Callback**: Google redirects back to your app with a generic `code`.
5.  **Exchange**: Your server (backend-to-backend) exchanges this `code` for an `Access Token` (JWT).

## Security Vulnerabilities to Avoid

1.  **Don't store JWTs in LocalStorage**: It's vulnerable to XSS attacks. Store them in `HttpOnly` cookies.
2.  **Short Expiry**: Tokens should last minutes, not days.
3.  **Refresh Tokens**: Use a long-lived refresh token to get new access tokens transparently.

Security is hard. Don't roll your own crypto. Use battle-tested libraries like Spring Security or Passport.js.
