---
layout: post
title: "Technical Interviews: What I Wish I Knew Earlier"
date: 2025-08-20
categories: [Career, Interviews]
tags: [Interviews, Career, Coding, System Design]
---

After 50+ technical interviews (both sides of the table), here's what actually matters.

## The Interview Loop

1. **Phone Screen** (30 min): Coding basics
2. **Technical Round 1** (60 min): Data structures & algorithms
3. **Technical Round 2** (60 min): System design
4. **Behavioral** (45 min): STAR method
5. **Final Round** (30 min): Culture fit

## Coding Interviews

### What They're Really Testing

- Can you write working code?
- Can you communicate your thought process?
- Can you handle ambiguity?
- Can you optimize?

### The Framework

```
1. Clarify requirements (5 min)
2. Discuss approach (5 min)
3. Code solution (30 min)
4. Test and optimize (10 min)
```

### Example Problem

**Question:** "Find two numbers in an array that sum to a target."

**Bad Response:**
```python
# Just start coding
for i in range(len(arr)):
    for j in range(i+1, len(arr)):
        if arr[i] + arr[j] == target:
            return [i, j]
```

**Good Response:**
```
Me: "Can the array have duplicates?"
Interviewer: "Yes"

Me: "Should I return indices or values?"
Interviewer: "Indices"

Me: "Can I use extra space?"
Interviewer: "Yes"

Me: "I'll use a hash map. Time O(n), space O(n)."
[Then code the solution]
```

## System Design Interviews

### The Framework

```
1. Requirements (10 min)
   - Functional: What features?
   - Non-functional: Scale? Latency?

2. High-level design (15 min)
   - Draw boxes and arrows
   - Identify components

3. Deep dive (25 min)
   - Database schema
   - API design
   - Scaling bottlenecks

4. Trade-offs (10 min)
   - CAP theorem
   - Consistency vs availability
```

### Example: Design Twitter

**Requirements:**
- 300M users
- 100M daily active
- 500M tweets/day
- Read-heavy (100:1 read/write ratio)

**High-Level:**
```
Client → Load Balancer → API Servers → Cache → Database
                                      ↓
                                   Message Queue → Timeline Service
```

**Deep Dive:**
- Database: PostgreSQL for users, Cassandra for tweets
- Cache: Redis for timelines
- CDN: For media files
- Sharding: By user ID

## Behavioral Interviews

### STAR Method

**Situation:** Set the context
**Task:** What needed to be done
**Action:** What you did
**Result:** What happened

**Example:**

**Question:** "Tell me about a time you had a conflict with a teammate."

**Bad:**
"We disagreed about architecture. I convinced them I was right."

**Good:**
"**Situation:** We were building a microservices system. My teammate wanted to use REST, I preferred gRPC.

**Task:** We needed to decide quickly to meet our deadline.

**Action:** I proposed we prototype both approaches over a weekend. We measured latency, throughput, and developer experience.

**Result:** gRPC was 3x faster but harder to debug. We chose REST for the MVP, documented gRPC as a future optimization. The team appreciated the data-driven approach."

## Common Mistakes

1. **Not asking questions** - Always clarify requirements
2. **Jumping to code** - Discuss approach first
3. **Staying silent** - Think out loud
4. **Giving up** - Ask for hints
5. **Not testing** - Walk through examples

## Preparation Tips

### For Coding
- LeetCode: 150 problems (Easy: 50, Medium: 80, Hard: 20)
- Focus on patterns: Two pointers, sliding window, DFS/BFS
- Practice on a whiteboard or Google Doc (not IDE)

### For System Design
- Read "Designing Data-Intensive Applications"
- Study real systems: Twitter, Netflix, Uber
- Practice drawing diagrams

### For Behavioral
- Prepare 5-7 STAR stories
- Cover: leadership, conflict, failure, success
- Practice out loud

## The Day Of

- **Sleep well** - More important than last-minute cramming
- **Arrive early** - 15 minutes buffer
- **Ask questions** - Shows engagement
- **Be honest** - "I don't know, but here's how I'd figure it out"
- **Follow up** - Send thank-you email within 24 hours

## Red Flags (From Interviewer Side)

- Arrogant or dismissive
- Can't explain past work
- Blames others for failures
- Doesn't ask any questions
- Gives up easily

## Conclusion

Interviews are a skill. Practice makes perfect.

**Key Takeaways:**
- Clarify before coding
- Communicate your thought process
- Use frameworks (STAR, system design)
- Practice consistently
- Be yourself

---

*What interview question stumped you? Share your experience!*
