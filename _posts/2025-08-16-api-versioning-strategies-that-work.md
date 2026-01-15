---
layout: post
title: "API Versioning Strategies That Actually Work"
date: 2025-08-16
categories: [Backend, API Design]
tags: [API, Versioning, REST, Best Practices]
---

Breaking changes are inevitable. API versioning lets you evolve your API without breaking existing clients. Here are the strategies that work in production.

## Strategy 1: URL Versioning (Most Common)

```
GET /api/v1/users
GET /api/v2/users
```

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

## Strategy 2: Header Versioning

```
GET /api/users
Accept: application/vnd.myapp.v1+json

GET /api/users
Accept: application/vnd.myapp.v2+json
```

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

## Strategy 3: Query Parameter

```
GET /api/users?version=1
GET /api/users?version=2
```

**Pros:**
- Simple
- Optional (can default to latest)

**Cons:**
- Not RESTful
- Easy to forget

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

### 2. Sunset Header

```java
.header("Sunset", "Sat, 31 Dec 2024 23:59:59 GMT")
```

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

## Conclusion

**Recommendation:** Use URL versioning for simplicity.

**Key Takeaways:**
- Version only when breaking changes occur
- Deprecate old versions gradually
- Document migration paths
- Support old versions for 6-12 months

---

*How do you version your APIs? Share your approach!*
