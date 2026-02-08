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

This guarantees your artifact builds before Docker adds complexity.

If your app uses profiles, verify that `application.properties` and `application-<profile>.properties` load correctly before you containerize.

## 2. The Dockerfile

Create a file named `Dockerfile` in the root directory. We'll use a multi-stage build to keep the image small.

```dockerfile
# Stage 1: Build the JAR
FROM maven:3.8.4-openjdk-17 as builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the Runtime Image
FROM openjdk:17-jdk-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

This Dockerfile builds a single fat JAR and runs it in a minimal runtime layer. Keep it simple until you need native libraries or extra runtime dependencies.

**Why Multi-stage?** 
The Maven image is huge (600MB+) because it contains all the build tools. The Alpine JDK runtime is tiny (<200MB). We build in the big image, copy *only* the JAR to the small image, and throw the big image away.

**Why copy `pom.xml` first?**
It allows Docker to cache the dependency download step. Small code changes won't invalidate your whole build.

## Add a `.dockerignore`

Reduce build context size and speed up builds:

```
target/
.git/
.idea/
*.iml
```

## 3. Building and Running

Build the image:
```bash
docker build -t my-spring-app .
```

Use a descriptive tag so you can track versions locally (`my-spring-app:1.0.0`).

Run it:
```bash
docker run -p 8080:8080 my-spring-app
```

If your app logs to stdout, it will show up in `docker logs <container-id>`, which is ideal for container environments.

## 4. Environment Variables

Never hardcode database URLs. Pass them at runtime.

In `application.properties`:
```properties
spring.datasource.url=${DB_URL}
```

This keeps secrets and environment-specific values out of source control.

Run with the env var:
```bash
docker run -p 8080:8080 -e DB_URL=jdbc:postgresql://host.docker.internal:5432/mydb my-spring-app
```

## Production Tips

1.  **Use a non-root user** for security:
    ```
    RUN addgroup -S app && adduser -S app -G app
    USER app
    ```
    This reduces the blast radius if the container is compromised.
2.  **Tune the JVM** with `JAVA_OPTS`:
    ```
    docker run -e JAVA_OPTS="-Xms256m -Xmx512m" my-spring-app
    ```
    Start with conservative memory limits to avoid noisy neighbors on shared hosts.
3.  **Add a health endpoint** for containers and orchestration:
    ```
    management.endpoints.web.exposure.include=health,info
    ```
    Orchestration platforms can use this for readiness/liveness checks.
4.  **Use profiles**:
    ```
    -e SPRING_PROFILES_ACTIVE=prod
    ```
    Profiles let you cleanly separate dev/test/prod configs.

Now your app is portable, scalable, and ready for Kubernetes or any container platform.
