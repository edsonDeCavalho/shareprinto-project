package com.starboy99.shareprintoauthentificationbackend.controller

import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/health")
class HealthController(
    private val mongoTemplate: MongoTemplate
) {
    
    @GetMapping
    fun health(): Map<String, Any> {
        return try {
            // Test MongoDB connection
            val dbName = mongoTemplate.db.name
            val collections = mongoTemplate.collectionNames
            
            mapOf(
                "status" to "UP",
                "timestamp" to LocalDateTime.now().toString(),
                "database" to mapOf(
                    "name" to dbName,
                    "status" to "CONNECTED",
                    "collections" to collections
                ),
                "service" to "shareprinto-authentification-backend"
            )
        } catch (e: Exception) {
            mapOf(
                "status" to "DOWN",
                "timestamp" to LocalDateTime.now().toString(),
                "error" to (e.message ?: "Unknown error"),
                "service" to "shareprinto-authentification-backend"
            )
        }
    }
    
    @GetMapping("/db")
    fun databaseHealth(): Map<String, Any> {
        return try {
            // Test database operations
            val dbName = mongoTemplate.db.name
            val collections = mongoTemplate.collectionNames
            
            mapOf(
                "database" to dbName,
                "status" to "CONNECTED",
                "collections" to collections,
                "timestamp" to LocalDateTime.now().toString()
            )
        } catch (e: Exception) {
            mapOf(
                "status" to "ERROR",
                "error" to (e.message ?: "Unknown error"),
                "timestamp" to LocalDateTime.now().toString()
            )
        }
    }
}
