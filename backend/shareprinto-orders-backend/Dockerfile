# ============================================================
# 📦 SharePrinto Orders Service
# Version: 1.0.0
# Maintainer: Edson de Carvalho <your@email.com>
# Description: Spring Boot Orders Service built with Gradle and OpenJDK 17
# ============================================================

# 1️⃣ Build stage
FROM openjdk:17-jdk-slim AS builder

LABEL version="1.0.0" \
      maintainer="Edson de Carvalho <your@email.com>" \
      service="orders-service" \
      description="Build stage for SharePrinto Orders backend using Gradle and OpenJDK 17."

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
      service="orders-service" \
      description="Runtime stage for SharePrinto Orders backend."

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the built JAR file from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership to appuser
RUN chown appuser:appuser app.jar

# Switch to non-root user
USER appuser

# Expose the port the Orders Service runs on
EXPOSE 8081

# JVM options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -Djava.security.egd=file:/dev/./urandom"

# Set Spring profile for Docker
ENV SPRING_PROFILES_ACTIVE=docker

# Health check for Orders Service
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Run the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
