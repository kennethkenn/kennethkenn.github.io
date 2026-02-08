---
layout: post
title: "API Versioning Strategies That Actually Work"
date: 2025-08-16
categories: [Backend, API Design]
tags: [API, Versioning, REST, Best Practices]
---

Breaking changes are inevitable. API versioning lets you evolve your API without breaking existing clients. Here are the strategies that work in production, plus how to decide when a new version is actually needed.

## What Counts as a Breaking Change

1.  Removing a field or endpoint.
2.  Changing a field type or meaning.
3.  Making a previously optional field required.
4.  Changing validation rules that reject valid old inputs.

Adding optional fields is usually **backward compatible** and should not require a new version.

## Strategy 1: URL Versioning (Most Common)

```
GET /api/v1/users
GET /api/v2/users
```

These are completely separate routes. Your router or gateway can map `/api/v1` and `/api/v2` to different controllers or services without extra headers.

**Pros:**
- Clear and explicit
- Easy to route
- Simple to test

**Cons:**
- Clutters URLs
- Requires duplicate code

**Implementation (Spring Boot):**
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    @GetMapping
    public List<UserV1> getUsers() {
        return userService.getUsersV1();
    }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    @GetMapping
    public List<UserV2> getUsers() {
        return userService.getUsersV2();
    }
}
```
This makes each version a first-class controller, which is easy to reason about. The tradeoff is you may duplicate logic or maintain compatibility adapters.

## Strategy 2: Header Versioning

```
GET /api/users
Accept: application/vnd.myapp.v1+json

GET /api/users
Accept: application/vnd.myapp.v2+json
```

This keeps URLs clean but shifts complexity to client configuration and testing tools.

**Pros:**
- Clean URLs
- RESTful

**Cons:**
- Harder to test (can't use browser)
- Less discoverable

**Implementation:**
```java
@GetMapping(value = "/users", produces = "application/vnd.myapp.v1+json")
public List<UserV1> getUsersV1() {
    return userService.getUsersV1();
}

@GetMapping(value = "/users", produces = "application/vnd.myapp.v2+json")
public List<UserV2> getUsersV2() {
    return userService.getUsersV2();
}
```
You can keep a single route and let Spring negotiate the correct version via `produces`. Document this clearly for client teams.

## Strategy 3: Query Parameter

```
GET /api/users?version=1
GET /api/users?version=2
```

This is easy to add to existing APIs, but be careful: caches might treat both versions as the same resource unless you vary by query param.

**Pros:**
- Simple
- Optional (can default to latest)

**Cons:**
- Not RESTful
- Easy to forget

## Strategy 4: Separate Hostname (Large Platforms)

```
https://v1.api.example.com/users
https://v2.api.example.com/users
```

This is clean at scale, but it adds DNS and infrastructure overhead and makes local development more complex.

## Best Practices

### 1. Deprecation Warnings

```java
@GetMapping("/api/v1/users")
@Deprecated
public ResponseEntity<List<User>> getUsersV1() {
    return ResponseEntity.ok()
        .header("X-API-Warn", "This version is deprecated. Use /api/v2/users")
        .body(users);
}
```
Use a consistent warning header so client teams can surface deprecation notices in logs and dashboards.

### 2. Sunset Header

```java
.header("Sunset", "Sat, 31 Dec 2024 23:59:59 GMT")
```
The `Sunset` header communicates the planned removal date. Choose a date you can actually honor.

### 2b. Link to Migration Docs

```java
.header("Link", "<https://docs.myapp.com/api/v2-migration>; rel=\"deprecation\"")
```
This gives clients a clickable migration path right in the response metadata.

### 3. Changelog Documentation

```markdown
## v2.0.0 (2024-01-15)
### Breaking Changes
- `user.name` split into `user.firstName` and `user.lastName`
- `POST /users` now requires `email` field

### Migration Guide
```json
// v1
{"name": "John Doe"}

// v2
{"firstName": "John", "lastName": "Doe"}
```
Keep changelogs concise and point to a deeper migration doc if needed. The JSON example makes the change obvious without requiring narrative.

### 4. Default Versioning Policy

Decide what happens when no version is specified:

1.  **Pin to oldest supported**: safer for legacy clients.
2.  **Pin to latest**: faster evolution but riskier.
3.  **Require explicit version**: clearer contracts, more boilerplate.

### 5. Contract Tests

Use consumer-driven contract tests so you catch breaking changes before clients do. This can be as simple as a shared Postman collection or as formal as Pact.

## Conclusion

**Recommendation:** Use URL versioning for simplicity.

**Key Takeaways:**
- Version only when breaking changes occur
- Deprecate old versions gradually
- Document migration paths
- Support old versions for 6-12 months

---

*How do you version your APIs? Share your approach!*
