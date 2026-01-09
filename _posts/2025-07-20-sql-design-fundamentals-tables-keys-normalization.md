---
layout: post
title: "SQL Design Fundamentals: Tables, Keys, and Normalization"
date: 2025-07-20 12:00:00 +0300
categories: sql databases data-modeling
---

## Introduction

Good database design is the foundation of reliable and scalable applications. Poor schema decisions made early often lead to data inconsistencies, complex queries, and performance issues later.

This post covers the core principles of SQL database design—**tables, keys, and normalization**—and explains how to apply them in practical, real-world systems.

---

## Understanding Tables

A table represents a single type of entity in your system.

Examples of entities include:

- Users
- Orders
- Products
- Categories

Each table should model **one concept only**.

### Table Structure Basics

A table consists of:

- Columns (attributes)
- Rows (records)

Example:

```sql
CREATE TABLE users (
    id INT,
    name VARCHAR(100),
    email VARCHAR(255)
);
````

At this stage, the table works—but it lacks constraints and structure.

---

## Primary Keys

A **primary key** uniquely identifies each row in a table.

### Characteristics of a Good Primary Key

- Unique
- Not null
- Stable (does not change)
- Minimal

Example:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);
```

Most modern systems use surrogate keys such as auto-incremented integers or UUIDs.

---

## Foreign Keys and Relationships

Foreign keys establish relationships between tables.

Example:

- A user can place many orders
- Each order belongs to one user

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Foreign keys:

- Enforce referential integrity
- Prevent orphaned records
- Make relationships explicit

---

## Understanding Normalization

Normalization is the process of organizing data to reduce redundancy and improve integrity.

The goal is not complexity—it is **correctness and maintainability**.

---

## First Normal Form (1NF)

A table is in 1NF if:

- Each column contains atomic values
- There are no repeating groups

### Violation Example

```text
orders
-----------------------
id | products
1  | pen, pencil, book
```

### Corrected Design

```text
orders
---------
id

order_items
-------------
order_id | product
```

---

## Second Normal Form (2NF)

A table is in 2NF if:

- It is in 1NF
- All non-key columns depend on the entire primary key

This mainly applies to composite keys.

---

## Third Normal Form (3NF)

A table is in 3NF if:

- It is in 2NF
- There are no transitive dependencies

### Violation Example

```text
users
-----------------------------
id | city | country
```

If `city` determines `country`, then `country` does not belong in this table.

### Corrected Design

```text
cities
---------
id | city | country

users
---------
id | city_id
```

---

## When to Denormalize

Normalization is not a strict rule—it is a guideline.

Denormalization may be appropriate when:

- Read performance is critical
- Data is mostly static
- Duplication is controlled and intentional

Always normalize first, then denormalize **only when necessary**.

---

## Indexes and Keys

Indexes improve query performance but come with trade-offs.

Best practices:

- Index primary keys automatically
- Index foreign keys frequently used in joins
- Avoid over-indexing

Indexes speed up reads but slow down writes.

---

## Common Design Mistakes

- Storing multiple values in a single column
- Using meaningful data as primary keys (e.g., emails)
- Missing foreign key constraints
- Overusing `NULL`
- Designing without understanding queries

---

## Conclusion

Good SQL design is about understanding data relationships and enforcing them through structure and constraints. Tables, keys, and normalization work together to create systems that are consistent, efficient, and maintainable.

A well-designed database simplifies application logic and prevents entire classes of bugs.

---

## Final Advice

Design your schema as carefully as you design your code. Databases are not just storage—they are part of your application’s logic.
