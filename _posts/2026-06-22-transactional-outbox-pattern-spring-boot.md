---
layout: post
title: "Building Resilient Distributed Systems with the Transactional Outbox Pattern in Spring Boot"
date: 2026-06-22
categories: [Backend, Spring-Boot]
tags: [Spring Boot, Microservices, Kafka, PostgreSQL, Distributed Systems]
---

In distributed architectures, one of the most common failure modes occurs when updating a local relational database and publishing an event to a message broker like Apache Kafka or RabbitMQ.

If your database transaction commits but the network partition prevents Kafka from receiving the event, your downstream services miss critical updates. Conversely, if you publish to Kafka first and the subsequent DB commit rolls back, you broadcast phantom events.

Here is how to solve the dual-write problem using the **Transactional Outbox Pattern** in Spring Boot.

---

## The Dual-Write Problem

Consider this innocent-looking Spring service:

```java
@Transactional
public Order createOrder(CreateOrderRequest request) {
    Order order = orderRepository.save(new Order(request));
    
    // Danger: What if Kafka broker is temporarily unreachable?
    // What if the DB transaction fails to commit right after this line?
    kafkaTemplate.send("order-created", new OrderCreatedEvent(order.getId()));
    
    return order;
}
```

Distributed transactions (such as Two-Phase Commit / XA) introduce catastrophic latency and tight coupling. We need an asynchronous, eventually consistent mechanism that guarantees **at-least-once delivery** without distributed locks.

---

## Architecture of the Transactional Outbox Pattern

Instead of sending messages directly to the message broker, we write the event into an `outbox` table **within the exact same database transaction** that modifies our domain entities.

```
+--------------------------------------------------------------------------+
| Application Service                                                      |
|                                                                          |
|  1. BEGIN TRANSACTION                                                    |
|  2. INSERT INTO orders (...)                                             |
|  3. INSERT INTO outbox_events (aggregate_id, event_type, payload, ...)    |
|  4. COMMIT TRANSACTION                                                   |
+--------------------------------------------------------------------------+
                                     |
                                     v
                       +---------------------------+
                       | PostgreSQL / MySQL Database|
                       |                           |
                       |  - orders table           |
                       |  - outbox_events table    |
                       +---------------------------+
                                     |
                                     v
                      Polling Worker or CDC (Debezium)
                                     |
                                     v
                           +-------------------+
                           |   Apache Kafka    |
                           +-------------------+
```

Because relational databases guarantee ACID properties, the domain state change and the event record commit or rollback **atomically**.

---

## Step 1: The Outbox Entity and Schema

```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_pending ON outbox_events (status, created_at)
WHERE status = 'PENDING';
```

In Java, map this entity using JPA:

```java
@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String aggregateType;

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false)
    private String eventType;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutboxStatus status;

    private int retryCount;
    private Instant createdAt;
    private Instant processedAt;

    // Constructors, Getters, and Setters
}
```

---

## Step 2: Atomic Saving in the Application Service

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository,
                        OutboxEventRepository outboxRepository,
                        ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Order placeOrder(CreateOrderRequest request) {
        Order order = orderRepository.save(new Order(request));

        OrderCreatedEvent event = new OrderCreatedEvent(
            order.getId(),
            order.getCustomerId(),
            order.getTotalAmount()
        );

        OutboxEvent outboxEvent = new OutboxEvent(
            UUID.randomUUID(),
            "ORDER",
            order.getId().toString(),
            "OrderCreated",
            objectMapper.writeValueAsString(event),
            OutboxStatus.PENDING,
            Instant.now()
        );

        outboxRepository.save(outboxEvent);
        return order;
    }
}
```

---

## Step 3: Polling and Publishing Worker with Row-Level Locking

To publish outbox records to Kafka safely without race conditions across multiple application instances, use PostgreSQL `SKIP LOCKED`:

```java
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    @Query(value = """
        SELECT * FROM outbox_events
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT :limit
        FOR UPDATE SKIP LOCKED
        """, nativeQuery = true)
    List<OutboxEvent> lockPendingEvents(@Param("limit") int limit);
}
```

Now, implement a scheduled publisher:

```java
@Component
public class OutboxPublisher {

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPublisher(OutboxEventRepository outboxRepository,
                           KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxRepository = outboxRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 500)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> events = outboxRepository.lockPendingEvents(50);

        for (OutboxEvent event : events) {
            try {
                kafkaTemplate.send(
                    "domain-events",
                    event.getAggregateId(), // Kafka partition key guarantees ordering
                    event.getPayload()
                ).get(3, TimeUnit.SECONDS);

                event.setStatus(OutboxStatus.PROCESSED);
                event.setProcessedAt(Instant.now());
            } catch (Exception ex) {
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus(OutboxStatus.FAILED);
                }
            }
        }
    }
}
```

---

## Polling Publisher vs. Change Data Capture (CDC / Debezium)

| Feature | Polling Publisher (`SKIP LOCKED`) | CDC Engine (Debezium + Kafka Connect) |
| :--- | :--- | :--- |
| **Complexity** | Extremely low; zero external infra | Requires Kafka Connect cluster & ZooKeeper/KRaft |
| **Database Load** | Periodic queries against indexed table | Reads PostgreSQL WAL directly (negligible DB CPU) |
| **Latency** | 200ms - 1s (polling interval) | 5ms - 20ms (sub-second streaming) |
| **Recommended For** | Small-to-medium systems | High-throughput, enterprise-scale event streams |

---

## Consumer-Side Idempotency

Because the outbox pattern guarantees **at-least-once delivery**, consumers must be idempotent. Always include an `eventId` or `idempotencyKey` in your payloads and record processed event IDs in an `idempotent_consumer` table on the receiving service before executing business logic.

The Transactional Outbox pattern eliminates the brittleness of distributed dual-writes, providing rock-solid event delivery in microservice architectures.
