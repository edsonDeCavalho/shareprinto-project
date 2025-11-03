# syntax=docker/dockerfile:1
# Version 1.0.0 - Dockerfile for Orchestrator Service

# 1️⃣ Build stage
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Gradle files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Copy source code
COPY src src

RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# 2️⃣ Runtime stage
FROM eclipse-temurin:17-jre-jammy

LABEL version="1.0.0" \
      maintainer="edsonDeCavalho" \
      description="Orchestrator Service for SharePrinto"

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown appuser:appuser app.jar

USER appuser

EXPOSE 8085

ENV JAVA_OPTS="-Xmx512m -Xms256m -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=docker

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
