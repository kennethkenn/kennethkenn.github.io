---
layout: post
title: "Database Connection Pooling: HikariCP Deep Dive"
date: 2025-08-15
categories: [Backend, Database]
tags: [HikariCP, Connection Pooling, Performance, Spring Boot]
---

Creating database connections is expensive (~50-100ms each). Connection pooling reuses connections, dramatically improving performance. HikariCP is the fastest, most reliable pool available.

## Why Connection Pooling?

```java
// Bad: Create new connection for each request
public User getUser(int id) {
    Connection conn = DriverManager.getConnection(url, user, password);  // 50ms!
    // ... query database
    conn.close();
}

// Good: Reuse pooled connections
public User getUser(int id) {
    Connection conn = dataSource.getConnection();  // <1ms
    // ... query database
    conn.close();  // Returns to pool
}
```

## Spring Boot Configuration

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: user
    password: pass
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

## Key Settings Explained

### maximum-pool-size
```yaml
maximum-pool-size: 10  # Max connections
```

**Formula:** `connections = ((core_count * 2) + effective_spindle_count)`

For a 4-core server with SSD: `(4 * 2) + 1 = 9`

**Too high:** Wastes resources, database overload
**Too low:** Request queuing, slow responses

### minimum-idle
```yaml
minimum-idle: 5  # Keep 5 connections ready
```

Hikari maintains this many idle connections for fast access.

### connection-timeout
```yaml
connection-timeout: 30000  # 30 seconds
```

Max time to wait for a connection from the pool before throwing exception.

### idle-timeout
```yaml
idle-timeout: 600000  # 10 minutes
```

Close idle connections after this time (if above minimum-idle).

### max-lifetime
```yaml
max-lifetime: 1800000  # 30 minutes
```

Close connections after this time to prevent stale connections.

## Monitoring

```java
@Component
public class HikariMetrics {
    @Autowired
    private HikariDataSource hikariDataSource;
    
    @Scheduled(fixedRate = 60000)
    public void logPoolStats() {
        HikariPoolMXBean poolProxy = hikariDataSource.getHikariPoolMXBean();
        
        log.info("Active connections: {}", poolProxy.getActiveConnections());
        log.info("Idle connections: {}", poolProxy.getIdleConnections());
        log.info("Total connections: {}", poolProxy.getTotalConnections());
        log.info("Threads awaiting connection: {}", poolProxy.getThreadsAwaitingConnection());
    }
}
```

## Common Issues

### 1. Connection Leaks
```java
// Bad: Connection never returned to pool
public void badMethod() {
    Connection conn = dataSource.getConnection();
    // ... do work
    // Forgot conn.close()!
}

// Good: Use try-with-resources
public void goodMethod() {
    try (Connection conn = dataSource.getConnection()) {
        // ... do work
    }  // Automatically closed
}
```

### 2. Pool Exhaustion
```
HikariPool-1 - Connection is not available, request timed out after 30000ms.
```

**Solutions:**
- Increase `maximum-pool-size`
- Fix connection leaks
- Optimize slow queries

### 3. Database Firewall Timeouts
```yaml
# Keep connections alive
hikari:
  keepalive-time: 30000  # Ping every 30s
```

## Performance Tuning

```yaml
hikari:
  # Disable auto-commit for batch operations
  auto-commit: false
  
  # Reduce overhead
  register-mbeans: false
  
  # Custom connection test query (if needed)
  connection-test-query: SELECT 1
```

## Conclusion

HikariCP is production-ready out-of-the-box. Key takeaways:
- Set `maximum-pool-size` based on CPU cores
- Always use try-with-resources
- Monitor pool metrics
- Tune for your workload

---

*What connection pool issues have you encountered? Share your solutions!*
