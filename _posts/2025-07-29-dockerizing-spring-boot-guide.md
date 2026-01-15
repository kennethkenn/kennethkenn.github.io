---
layout: post
title: "Dockerizing a Spring Boot Application"
date: 2025-07-29
categories: [DevOps, Java]
description: "A step-by-step tutorial on creating a production-ready Dockerfile for Spring Boot applications."
tags: [docker, java, spring-boot, devops, containers]
---

"It works on my machine" is an excuse that died with Docker. Containerizing your Java application ensures it runs the same way on your laptop, the testing server, and production.

Here is the standard 4-step process I use for all my Spring Boot projects.

## 1. The Application

Assume you have a standard Maven structure. First, ensure you can build it locally:
```bash
./mvnw clean package
```

## 2. The Dockerfile

Create a file named `Dockerfile` in the root directory. We'll use a multi-stage build to keep the image small.

```dockerfile
# Stage 1: Build the JAR
FROM maven:3.8.4-openjdk-17 as builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the Runtime Image
FROM openjdk:17-jdk-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

**Why Multi-stage?** 
The Maven image is huge (600MB+) because it contains all the build tools. The Alpine JDK runtime is tiny (<200MB). We build in the big image, copy *only* the JAR to the small image, and throw the big image away.

## 3. Building and Running

Build the image:
```bash
docker build -t my-spring-app .
```

Run it:
```bash
docker run -p 8080:8080 my-spring-app
```

## 4. Environment Variables

Never hardcode database URLs. Pass them at runtime.

In `application.properties`:
```properties
spring.datasource.url=${DB_URL}
```

Run with the env var:
```bash
docker run -p 8080:8080 -e DB_URL=jdbc:postgresql://host.docker.internal:5432/mydb my-spring-app
```

Now your app is portable, scalable, and ready for Kubernetes!
