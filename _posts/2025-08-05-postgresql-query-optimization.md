---
layout: post
title: "PostgreSQL Query Optimization: From EXPLAIN to Indexes"
date: 2025-08-05
categories: [Backend, Database]
tags: [PostgreSQL, SQL, Performance, Optimization]
---

Slow queries are the silent killer of application performance. A query that takes 2 seconds instead of 20ms can bring your entire system to its knees under load. In this comprehensive guide, we'll master PostgreSQL query optimization using `EXPLAIN`, indexes, and query rewriting techniques.

## The Problem: A Slow Query

Let's start with a real-world scenario. You have a users table with 1 million rows:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_login TIMESTAMP,
    subscription_tier VARCHAR(50)
);
```

This query is killing your API response times:

```sql
SELECT * FROM users 
WHERE email = 'john@example.com' 
  AND subscription_tier = 'premium';
```

Execution time: **1,850ms**. Unacceptable.

## Step 1: Understanding EXPLAIN

`EXPLAIN` shows PostgreSQL's query execution plan:

```sql
EXPLAIN SELECT * FROM users 
WHERE email = 'john@example.com' 
  AND subscription_tier = 'premium';
```

Output:

```
Seq Scan on users  (cost=0.00..25000.00 rows=1 width=120)
  Filter: ((email = 'john@example.com') AND (subscription_tier = 'premium'))
```

**Key Insights:**

- **Seq Scan**: Sequential scan (table scan) - reading every single row
- **cost**: Estimated cost units (not milliseconds)
- **rows**: Estimated rows returned
- **width**: Average row size in bytes

Sequential scans are fine for small tables (<10K rows) but catastrophic for large ones.

## Step 2: EXPLAIN ANALYZE - Real Execution

`EXPLAIN ANALYZE` actually runs the query and shows real metrics:

```sql
EXPLAIN ANALYZE SELECT * FROM users 
WHERE email = 'john@example.com' 
  AND subscription_tier = 'premium';
```

Output:

```
Seq Scan on users  (cost=0.00..25000.00 rows=1 width=120) 
                   (actual time=1823.45..1823.46 rows=1 loops=1)
  Filter: ((email = 'john@example.com') AND (subscription_tier = 'premium'))
  Rows Removed by Filter: 999999
Planning Time: 0.123 ms
Execution Time: 1823.52 ms
```

**Critical Metrics:**

- **actual time**: Real execution time in milliseconds
- **Rows Removed by Filter**: 999,999 rows scanned but discarded
- **Execution Time**: Total query time

We're scanning 1 million rows to find 1 result. This is the problem.

## Step 3: Creating an Index

Indexes are data structures that allow fast lookups. Think of them as a book's index - instead of reading every page, you jump directly to the relevant section.

```sql
CREATE INDEX idx_users_email ON users(email);
```

Now let's check the query plan:

```sql
EXPLAIN ANALYZE SELECT * FROM users 
WHERE email = 'john@example.com' 
  AND subscription_tier = 'premium';
```

Output:

```
Index Scan using idx_users_email on users  
  (cost=0.42..8.44 rows=1 width=120) 
  (actual time=0.034..0.035 rows=1 loops=1)
  Index Cond: (email = 'john@example.com')
  Filter: (subscription_tier = 'premium')
Planning Time: 0.156 ms
Execution Time: 0.052 ms
```

**Improvement: 1,823ms → 0.052ms (35,000x faster!)**

## Understanding Index Types

### B-Tree Index (Default)

Best for equality and range queries:

```sql
CREATE INDEX idx_created_at ON users(created_at);

-- Efficient queries:
WHERE created_at > '2024-01-01'
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
WHERE email = 'john@example.com'
```

### Hash Index

Only for equality:

```sql
CREATE INDEX idx_email_hash ON users USING HASH(email);

-- Efficient:
WHERE email = 'john@example.com'

-- NOT efficient:
WHERE email LIKE 'john%'
```

### GIN Index (Generalized Inverted Index)

For full-text search and JSONB:

```sql
CREATE INDEX idx_users_search ON users USING GIN(to_tsvector('english', email));

SELECT * FROM users 
WHERE to_tsvector('english', email) @@ to_tsquery('john');
```

### Partial Index

Index only a subset of rows:

```sql
CREATE INDEX idx_premium_users ON users(email) 
WHERE subscription_tier = 'premium';

-- This query uses the partial index:
SELECT * FROM users 
WHERE email = 'john@example.com' 
  AND subscription_tier = 'premium';
```

**Benefits:**
- Smaller index size
- Faster index scans
- Reduced write overhead

## Composite Indexes

For queries filtering on multiple columns:

```sql
CREATE INDEX idx_users_email_tier ON users(email, subscription_tier);
```

**Column Order Matters:**

```sql
-- Uses index efficiently:
WHERE email = 'john@example.com' AND subscription_tier = 'premium'
WHERE email = 'john@example.com'

-- Does NOT use index:
WHERE subscription_tier = 'premium'
```

**Rule**: Put the most selective column first (the one that filters out the most rows).

## Covering Indexes (Index-Only Scans)

Include all queried columns in the index:

```sql
CREATE INDEX idx_users_covering ON users(email, subscription_tier, last_login);

SELECT email, subscription_tier, last_login 
FROM users 
WHERE email = 'john@example.com';
```

Output:

```
Index Only Scan using idx_users_covering on users
  (cost=0.42..4.44 rows=1 width=50)
  Index Cond: (email = 'john@example.com')
  Heap Fetches: 0
```

**Heap Fetches: 0** means PostgreSQL didn't need to access the table at all - everything came from the index.

## Query Rewriting Techniques

### Avoid SELECT *

```sql
-- Bad: Fetches all columns
SELECT * FROM users WHERE email = 'john@example.com';

-- Good: Fetch only needed columns
SELECT id, email, subscription_tier FROM users WHERE email = 'john@example.com';
```

### Use EXISTS Instead of COUNT

```sql
-- Bad: Counts all rows
SELECT COUNT(*) FROM users WHERE subscription_tier = 'premium';
IF count > 0 THEN ...

-- Good: Stops at first match
SELECT EXISTS(SELECT 1 FROM users WHERE subscription_tier = 'premium');
```

### Avoid Functions on Indexed Columns

```sql
-- Bad: Index not used
WHERE LOWER(email) = 'john@example.com'

-- Good: Index used
WHERE email = 'john@example.com'

-- If you must use LOWER, create a functional index:
CREATE INDEX idx_email_lower ON users(LOWER(email));
```

### Use LIMIT for Pagination

```sql
-- Bad: Fetches all rows, discards most
SELECT * FROM users ORDER BY created_at DESC;

-- Good: Fetches only needed rows
SELECT * FROM users ORDER BY created_at DESC LIMIT 20 OFFSET 0;
```

## Analyzing Join Performance

```sql
EXPLAIN ANALYZE
SELECT u.email, o.total 
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.subscription_tier = 'premium';
```

Output:

```
Hash Join  (cost=1000.00..5000.00 rows=100 width=50)
  Hash Cond: (o.user_id = u.id)
  ->  Seq Scan on orders o  (cost=0.00..3000.00 rows=10000 width=20)
  ->  Hash  (cost=500.00..500.00 rows=100 width=30)
        ->  Seq Scan on users u  (cost=0.00..500.00 rows=100 width=30)
              Filter: (subscription_tier = 'premium')
```

**Join Types:**

1. **Nested Loop**: Good for small tables
2. **Hash Join**: Good for medium tables
3. **Merge Join**: Good for large pre-sorted tables

**Optimization:**

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_users_tier ON users(subscription_tier);
```

## Monitoring Index Usage

Check which indexes are actually being used:

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

**If `idx_scan` is 0, the index is never used - consider dropping it.**

## Index Maintenance

### Bloat

Indexes can become bloated over time:

```sql
-- Rebuild index
REINDEX INDEX idx_users_email;

-- Rebuild all indexes on a table
REINDEX TABLE users;
```

### Vacuuming

```sql
-- Analyze table statistics
ANALYZE users;

-- Vacuum dead tuples
VACUUM users;

-- Vacuum and analyze
VACUUM ANALYZE users;
```

## Common Anti-Patterns

### 1. Over-Indexing

```sql
-- Don't create indexes on every column
CREATE INDEX idx_id ON users(id);  -- PRIMARY KEY already indexed!
CREATE INDEX idx_email1 ON users(email);
CREATE INDEX idx_email2 ON users(LOWER(email));
CREATE INDEX idx_email3 ON users(email, id);
```

**Cost**: Each index slows down INSERT/UPDATE/DELETE operations.

### 2. Wrong Data Types

```sql
-- Bad: String comparison
CREATE TABLE sessions (
    user_id VARCHAR(50)  -- Should be INTEGER
);

-- Good:
CREATE TABLE sessions (
    user_id INTEGER REFERENCES users(id)
);
```

### 3. N+1 Queries

```sql
-- Bad: 1 + N queries
users = SELECT * FROM users LIMIT 10;
for user in users:
    orders = SELECT * FROM orders WHERE user_id = user.id;

-- Good: 1 query with JOIN
SELECT u.*, o.* 
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LIMIT 10;
```

## Real-World Example: E-Commerce Query

**Before Optimization:**

```sql
SELECT p.name, p.price, c.name as category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price BETWEEN 10 AND 100
  AND p.stock > 0
  AND c.name = 'Electronics'
ORDER BY p.created_at DESC
LIMIT 20;

-- Execution Time: 3,200ms
```

**After Optimization:**

```sql
-- Indexes:
CREATE INDEX idx_products_price_stock ON products(price, stock) 
WHERE stock > 0;

CREATE INDEX idx_products_category_created ON products(category_id, created_at DESC);

CREATE INDEX idx_categories_name ON categories(name);

-- Execution Time: 12ms (266x faster)
```

## Conclusion

Query optimization is a systematic process:

1. **Measure**: Use `EXPLAIN ANALYZE`
2. **Identify**: Find sequential scans on large tables
3. **Index**: Create appropriate indexes
4. **Verify**: Re-run `EXPLAIN ANALYZE`
5. **Monitor**: Track index usage over time

**Key Takeaways:**

- Indexes are not free - they slow down writes
- Column order in composite indexes matters
- Partial indexes can be more efficient than full indexes
- Always test with production-like data volumes

**Next Steps:**

- Learn about query planner statistics with `pg_stats`
- Explore connection pooling for better resource utilization
- Study PostgreSQL's autovacuum settings

---

*What's the slowest query you've optimized? Share your war stories in the comments!*
