---
layout: post
title: "Building a Portfolio That Gets You Hired"
date: 2025-08-21
categories: [Career, Portfolio]
tags: [Portfolio, Career, Projects, Personal Branding]
---

Your portfolio is your technical resume. Here's how to build one that stands out.

## What Hiring Managers Look For

1. **Can you build things?** - Working projects
2. **Can you explain things?** - Clear documentation
3. **Do you care about quality?** - Clean code, tests
4. **Are you passionate?** - Personal projects beyond work

## Project Selection

### Quality > Quantity

**Bad:** 20 tutorial projects
**Good:** 3 original projects that solve real problems

### The Portfolio Formula

1. **Full-stack app** - Shows end-to-end skills
2. **Systems project** - Shows low-level understanding
3. **Open source contribution** - Shows collaboration

## Example Projects

### 1. Full-Stack: Task Manager

**Tech:** React + Spring Boot + PostgreSQL
**Features:**
- User authentication (JWT)
- Real-time updates (WebSockets)
- Responsive design
- Deployed to AWS

**Why it works:**
- Demonstrates common stack
- Shows deployment skills
- Real-world use case

### 2. Systems: Custom Database

**Tech:** C++, B-trees, WAL
**Features:**
- Key-value store
- ACID transactions
- Crash recovery

**Why it works:**
- Shows deep technical knowledge
- Differentiates from web devs
- Great conversation starter

### 3. Open Source: Contribute to Qt

**Contribution:** Fixed memory leak in QNetworkAccessManager
**Impact:** Used by thousands of applications

**Why it works:**
- Shows you can work with large codebases
- Demonstrates collaboration
- Adds credibility

## Documentation Matters

### README Template

```markdown
# Project Name

Brief description (1-2 sentences)

## Features
- Feature 1
- Feature 2

## Tech Stack
- Frontend: React, TypeScript
- Backend: Spring Boot, PostgreSQL
- Infrastructure: Docker, AWS

## Demo
[Live Demo](https://example.com) | [Video](https://youtube.com/...)

## Screenshots
![Screenshot](screenshot.png)

## Running Locally
```bash
docker-compose up
```

## Architecture
[Diagram of system design]

## Challenges & Solutions
**Challenge:** Handling 10K concurrent users
**Solution:** Implemented Redis caching, reduced DB calls by 80%
```

## Code Quality

### Show Your Best Work

```cpp
// Bad: No comments, unclear names
int f(int* a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}

// Good: Clear, documented
/**
 * Calculates the sum of an integer array.
 * @param array The input array
 * @param size Number of elements
 * @return Sum of all elements
 */
int calculateSum(const int* array, size_t size) {
    int sum = 0;
    for (size_t i = 0; i < size; i++) {
        sum += array[i];
    }
    return sum;
}
```

### Include Tests

```java
@Test
public void testUserRegistration() {
    User user = new User("john@example.com", "password123");
    userService.register(user);
    
    User retrieved = userService.findByEmail("john@example.com");
    assertEquals("john@example.com", retrieved.getEmail());
}
```

## Deployment

**Don't just show code - show it running.**

- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Heroku, Railway, AWS Free Tier
- **Database:** ElephantSQL, MongoDB Atlas

## Your Website

### Essential Pages

1. **Home:** Brief intro + featured projects
2. **Projects:** Detailed project showcases
3. **About:** Your story, skills, experience
4. **Blog:** Technical articles (like this one!)
5. **Contact:** Email, GitHub, LinkedIn

### This Website

This very site is built with:
- Jekyll (static site generator)
- GitHub Pages (free hosting)
- Custom SCSS (responsive design)

[View source on GitHub](https://github.com/kennethkenn/kennethkenn.github.io)

## Common Mistakes

1. **No live demos** - Always deploy
2. **Poor README** - First impression matters
3. **Incomplete projects** - Finish what you start
4. **No tests** - Shows you care about quality
5. **Outdated tech** - Use modern tools

## Conclusion

Your portfolio should:
- Showcase 3-5 quality projects
- Include live demos
- Have excellent documentation
- Demonstrate diverse skills
- Tell your story

**Action Items:**
1. Pick 3 project ideas
2. Build and deploy them
3. Write great READMEs
4. Create a personal website
5. Share on LinkedIn/Twitter

---

*What's in your portfolio? Share your projects!*
