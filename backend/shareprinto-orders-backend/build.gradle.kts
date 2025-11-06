plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.spring") version "2.0.21"
    id("org.springframework.boot") version "3.5.6"
    id("io.spring.dependency-management") version "1.1.7"
}


group = "com.starboy99"
version = "0.0.1-SNAPSHOT"
description = "shareprinto-orders-backend"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

extra["springAiVersion"] = "1.0.3"

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")
    
    // Optional: Security (commented out for now)
    // implementation("org.springframework.boot:spring-boot-starter-security")
    
    // Optional: WebSocket support
    // implementation("org.springframework.boot:spring-boot-starter-websocket")
    
    // Optional: Reactive support
    // implementation("org.springframework.boot:spring-boot-starter-data-mongodb-reactive")
    // implementation("org.springframework.boot:spring-boot-starter-webflux")
    // implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    // implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    
    // Optional: AI support
    // implementation("org.springframework.ai:spring-ai-starter-vector-store-mongodb-atlas")
    
    // Optional: Session management
    // implementation("org.springframework.session:spring-session-data-mongodb")

    implementation ("org.springframework.cloud:spring-cloud-stream-binder-kafka")
    implementation("org.springframework.cloud:spring-cloud-stream-binder-kafka-streams")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    implementation("org.apache.kafka:kafka-streams")
    implementation("org.springframework.kafka:spring-kafka")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("org.springframework.kafka:spring-kafka-test")
    implementation("org.springframework.boot:spring-boot-starter-security")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.boot:spring-boot-dependencies:3.5.6")
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2024.0.0")
        mavenBom("org.springframework.ai:spring-ai-bom:${property("springAiVersion")}")
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
