---
layout: post
title: "Event-Driven Architecture with Spring Boot and Kafka"
date: 2025-08-14
categories: [Architecture, Backend]
tags: [Spring Boot, Kafka, Event-Driven, Microservices]
---

Event-driven architecture decouples services by communicating through events instead of direct API calls. Here's how to implement it with Spring Boot and Kafka.

## Why Event-Driven?

**Traditional (Request-Response):**
```
Order Service → (HTTP) → Inventory Service → (HTTP) → Notification Service
```
- Tight coupling
- Synchronous (slow)
- Single point of failure

**Event-Driven:**
```
Order Service → Kafka → [Inventory Service, Notification Service, Analytics Service]
```
- Loose coupling
- Asynchronous (fast)
- Easy to add new consumers

## Setup

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: order-service
      auto-offset-reset: earliest
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

## Publishing Events

```java
@Service
public class OrderService {
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    public void createOrder(Order order) {
        // Save order to database
        orderRepository.save(order);
        
        // Publish event
        OrderEvent event = new OrderEvent(
            order.getId(),
            order.getCustomerId(),
            order.getTotal(),
            Instant.now()
        );
        
        kafkaTemplate.send("order-events", event.getOrderId(), event);
    }
}

@Data
public class OrderEvent {
    private String orderId;
    private String customerId;
    private BigDecimal total;
    private Instant timestamp;
}
```

## Consuming Events

```java
@Service
public class InventoryService {
    @KafkaListener(topics = "order-events", groupId = "inventory-service")
    public void handleOrderCreated(OrderEvent event) {
        log.info("Received order: {}", event.getOrderId());
        
        // Reserve inventory
        inventoryRepository.reserveItems(event.getOrderId());
    }
}

@Service
public class NotificationService {
    @KafkaListener(topics = "order-events", groupId = "notification-service")
    public void handleOrderCreated(OrderEvent event) {
        // Send confirmation email
        emailService.sendOrderConfirmation(event.getCustomerId(), event.getOrderId());
    }
}
```

## Error Handling

```java
@Configuration
public class KafkaConfig {
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, OrderEvent> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        
        // Retry 3 times
        factory.setCommonErrorHandler(new DefaultErrorHandler(
            new FixedBackOff(1000L, 3L)
        ));
        
        return factory;
    }
}

// Dead Letter Queue
@KafkaListener(topics = "order-events")
public void handleOrder(OrderEvent event) {
    try {
        processOrder(event);
    } catch (Exception e) {
        kafkaTemplate.send("order-events-dlq", event);
        throw e;
    }
}
```

## Event Sourcing Pattern

```java
@Entity
public class OrderAggregate {
    @Id
    private String id;
    
    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderEvent> events = new ArrayList<>();
    
    public void apply(OrderCreatedEvent event) {
        this.id = event.getOrderId();
        this.events.add(event);
    }
    
    public void apply(OrderShippedEvent event) {
        this.status = OrderStatus.SHIPPED;
        this.events.add(event);
    }
    
    // Rebuild state from events
    public static OrderAggregate fromEvents(List<OrderEvent> events) {
        OrderAggregate aggregate = new OrderAggregate();
        events.forEach(aggregate::apply);
        return aggregate;
    }
}
```

## Saga Pattern (Distributed Transactions)

```java
@Service
public class OrderSaga {
    @KafkaListener(topics = "order-created")
    public void onOrderCreated(OrderCreatedEvent event) {
        try {
            // Step 1: Reserve inventory
            inventoryService.reserve(event.getOrderId());
            kafkaTemplate.send("inventory-reserved", event);
        } catch (Exception e) {
            // Compensating transaction
            kafkaTemplate.send("order-failed", event);
        }
    }
    
    @KafkaListener(topics = "inventory-reserved")
    public void onInventoryReserved(InventoryReservedEvent event) {
        try {
            // Step 2: Process payment
            paymentService.charge(event.getOrderId());
            kafkaTemplate.send("payment-processed", event);
        } catch (Exception e) {
            // Rollback inventory
            inventoryService.release(event.getOrderId());
            kafkaTemplate.send("order-failed", event);
        }
    }
}
```

## Monitoring

```java
@Component
public class KafkaMetrics {
    @Autowired
    private MeterRegistry meterRegistry;
    
    @KafkaListener(topics = "order-events")
    public void handleOrder(OrderEvent event) {
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            processOrder(event);
            meterRegistry.counter("orders.processed.success").increment();
        } catch (Exception e) {
            meterRegistry.counter("orders.processed.failure").increment();
            throw e;
        } finally {
            sample.stop(meterRegistry.timer("orders.processing.time"));
        }
    }
}
```

## Best Practices

1. **Idempotency**: Handle duplicate events
```java
@Transactional
public void handleOrder(OrderEvent event) {
    if (processedEvents.contains(event.getId())) {
        return;  // Already processed
    }
    processOrder(event);
    processedEvents.add(event.getId());
}
```

2. **Schema Evolution**: Use Avro or Protobuf
3. **Partitioning**: Use order ID as key for ordering guarantees
4. **Monitoring**: Track lag, throughput, errors

## Conclusion

Event-driven architecture with Kafka enables:
- Loose coupling between services
- Horizontal scalability
- Fault tolerance
- Easy addition of new features

**Trade-offs:**
- Eventual consistency
- Debugging complexity
- Infrastructure overhead

---

*Have you implemented event-driven systems? Share your challenges!*
