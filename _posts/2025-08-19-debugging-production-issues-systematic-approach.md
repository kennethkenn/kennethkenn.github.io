---
layout: post
title: "Debugging Production Issues: A Systematic Approach"
date: 2025-08-19
categories: [Debugging, DevOps]
tags: [Debugging, Production, Troubleshooting]
---

Production issues are stressful. Here's a systematic approach to debug them quickly.

## The Framework

1. **Gather Information**
2. **Form Hypothesis**
3. **Test Hypothesis**
4. **Fix and Verify**
5. **Document**

## Step 1: Gather Information

### Logs
```bash
# Tail logs
tail -f /var/log/app.log

# Search for errors
grep -i "error" /var/log/app.log | tail -100

# Filter by time
awk '$0 >= "2024-01-15 14:00" && $0 <= "2024-01-15 15:00"' app.log
```

### Metrics
- CPU usage
- Memory usage
- Request rate
- Error rate
- Response time

### Recent Changes
```bash
# Git commits in last 24 hours
git log --since="24 hours ago" --oneline

# Deployments
kubectl rollout history deployment/myapp
```

## Step 2: Form Hypothesis

**Bad:** "Something is broken"
**Good:** "Database connection pool exhausted due to slow queries"

## Step 3: Test Hypothesis

```bash
# Check database connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

# Check slow queries
SELECT query, query_start, state 
FROM pg_stat_activity 
WHERE state != 'idle' 
AND query_start < now() - interval '5 seconds';
```

## Step 4: Fix and Verify

```bash
# Increase pool size
kubectl set env deployment/myapp HIKARI_MAX_POOL_SIZE=20

# Monitor
watch -n 1 'curl -s http://localhost:8080/actuator/metrics/hikari.connections.active'
```

## Step 5: Document

```markdown
## Incident: High Error Rate (2024-01-15)

**Symptoms:** 50% error rate, slow responses

**Root Cause:** Database connection pool exhausted

**Fix:** Increased pool size from 10 to 20

**Prevention:** Add alerting for pool utilization > 80%
```

## Common Patterns

### Memory Leak
```bash
# Heap dump
jmap -dump:format=b,file=heap.bin <pid>

# Analyze with Eclipse MAT
```

### CPU Spike
```bash
# Thread dump
jstack <pid> > threads.txt

# Profile with perf
perf record -p <pid> -g -- sleep 30
perf report
```

### Network Issues
```bash
# Check connectivity
telnet db.example.com 5432

# DNS resolution
nslookup db.example.com

# Packet capture
tcpdump -i any -w capture.pcap port 5432
```

## Tools

- **Logs:** ELK Stack, Splunk, CloudWatch
- **Metrics:** Prometheus, Grafana, Datadog
- **Tracing:** Jaeger, Zipkin
- **APM:** New Relic, AppDynamics

---

*What's your worst production incident? How did you solve it?*
