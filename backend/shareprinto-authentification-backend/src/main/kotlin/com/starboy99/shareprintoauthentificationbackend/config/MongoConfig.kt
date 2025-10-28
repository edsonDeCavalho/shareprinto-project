package com.starboy99.shareprintoauthentificationbackend.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.MongoClientSettings
import com.mongodb.ConnectionString
import com.mongodb.ServerApi
import com.mongodb.ServerApiVersion
import java.util.concurrent.TimeUnit

@Configuration
class MongoConfig : AbstractMongoClientConfiguration() {

    private val logger = LoggerFactory.getLogger(MongoConfig::class.java)

    @Value("\${spring.data.mongodb.uri}")
    private lateinit var mongoUri: String

    override fun getDatabaseName(): String {
        return "shareprinto"
    }

    override fun autoIndexCreation(): Boolean {
        return true
    }

    @Bean
    override fun mongoClient(): MongoClient {
        logger.info("🔗 Initializing MongoDB connection for VPS deployment...")
        logger.info("📡 MongoDB URI: ${mongoUri.replace(Regex("://[^:]+:[^@]+@"), "://***:***@")}")
        
        return try {
            val connectionString = ConnectionString(mongoUri)
            
            val settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .applyToConnectionPoolSettings { builder ->
                    builder.maxSize(20)
                    builder.minSize(5)
                    builder.maxWaitTime(300, TimeUnit.SECONDS)
                    builder.maxConnectionIdleTime(0, TimeUnit.MILLISECONDS)
                    builder.maxConnectionLifeTime(0, TimeUnit.MILLISECONDS)
                }
                .applyToSocketSettings { builder ->
                    builder.connectTimeout(30, TimeUnit.SECONDS)
                    builder.readTimeout(60, TimeUnit.SECONDS)
                }
                .applyToServerSettings { builder ->
                    builder.heartbeatFrequency(10, TimeUnit.SECONDS)
                    builder.minHeartbeatFrequency(500, TimeUnit.MILLISECONDS)
                }
                .serverApi(ServerApi.builder().version(ServerApiVersion.V1).build())
                .build()

            val client = MongoClients.create(settings)
            
            // Test connection
            client.listDatabaseNames().firstOrNull()
            logger.info("✅ MongoDB connection established successfully!")
            
            client
        } catch (e: Exception) {
            logger.error("❌ Failed to connect to MongoDB: ${e.message}")
            logger.error("🔍 Connection details: ${mongoUri.replace(Regex("://[^:]+:[^@]+@"), "://***:***@")}")
            throw e
        }
    }

    @Bean
    fun validatingMongoEventListener(): ValidatingMongoEventListener {
        return ValidatingMongoEventListener(validator())
    }

    @Bean
    fun validator(): LocalValidatorFactoryBean {
        return LocalValidatorFactoryBean()
    }
}
