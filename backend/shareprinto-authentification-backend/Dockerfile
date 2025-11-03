# ============================================================
# ☕ SharePrinto Auth Service
# Version: 1.0.0
# Maintainer: Edson de Carvalho <your@email.com>
# Description: Spring Boot Auth Service built with Gradle and OpenJDK 17
# ============================================================

# 1️⃣ Build stage
FROM openjdk:17-jdk-slim AS builder

LABEL version="1.0.0" \
      maintainer="Edson de Carvalho <your@email.com>" \
      service="auth-service" \
      description="Build stage for SharePrinto authentication backend using Gradle and OpenJDK 17."

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and configuration files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Copy source code
COPY src src

# Make Gradle wrapper executable
RUN chmod +x ./gradlew

# Build the application (skip tests for faster builds)
RUN ./gradlew build -x test

# 2️⃣ Runtime stage
FROM openjdk:17-jre-slim

LABEL version="1.0.0" \
      maintainer="Edson de Carvalho <your@email.com>" \
      service="auth-service" \
      description="Runtime stage for SharePrinto authentication backend."

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the JAR file from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership to the non-root user
RUN chown appuser:appuser app.jar

# Switch to the non-root user
USER appuser

# Expose the port that the auth service listens on (matches docker-compose)
EXPOSE 3000

# JVM options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -Djava.security.egd=file:/dev/./urandom"

# Spring Boot profile
ENV SPRING_PROFILES_ACTIVE=docker

# Health check for the service
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/actuator/health || exit 1

# Start the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
