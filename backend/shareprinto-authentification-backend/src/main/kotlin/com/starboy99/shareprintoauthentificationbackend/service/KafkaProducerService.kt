package com.starboy99.shareprintoauthentificationbackend.service

import com.starboy99.shareprintoauthentificationbackend.event.AuthEvent
import com.starboy99.shareprintoauthentificationbackend.event.UserEvent
import com.starboy99.shareprintoauthentificationbackend.event.UserEventType
import com.starboy99.shareprintoauthentificationbackend.model.User
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.support.SendResult
import org.springframework.stereotype.Service
import java.util.concurrent.CompletableFuture

@Service
class KafkaProducerService(
    private val kafkaTemplate: KafkaTemplate<String, Any>,
    @Value("\${kafka.topics.user-events}") private val userEventsTopic: String,
    @Value("\${kafka.topics.auth-events}") private val authEventsTopic: String,
    @Value("\${kafka.topics.user-login-topic}") private val userLoginTopic: String
) {
    
    private val logger = LoggerFactory.getLogger(KafkaProducerService::class.java)
    
    /**
     * Send user event to Kafka
     */
    fun sendUserEvent(userEvent: UserEvent): CompletableFuture<SendResult<String, Any>> {
        logger.info("Sending user event: ${userEvent.eventType} for user: ${userEvent.userId}")
        
        return kafkaTemplate.send(userEventsTopic, userEvent.userId, userEvent)
            .whenComplete { result, throwable ->
                if (throwable != null) {
                    logger.error("Failed to send user event: ${userEvent.eventType} for user: ${userEvent.userId}", throwable)
                } else {
                    logger.info("Successfully sent user event: ${userEvent.eventType} for user: ${userEvent.userId}")
                }
            }
    }
    
    /**
     * Send authentication event to Kafka
     */
    fun sendAuthEvent(authEvent: AuthEvent): CompletableFuture<SendResult<String, Any>> {
        logger.info("Sending auth event: ${authEvent.eventType} for user: ${authEvent.userId}")
        
        val key = authEvent.userId ?: authEvent.sessionId ?: "anonymous"
        
        return kafkaTemplate.send(authEventsTopic, key, authEvent)
            .whenComplete { result, throwable ->
                if (throwable != null) {
                    logger.error("Failed to send auth event: ${authEvent.eventType} for user: ${authEvent.userId}", throwable)
                } else {
                    logger.info("Successfully sent auth event: ${authEvent.eventType} for user: ${authEvent.userId}")
                }
            }
    }
    
    /**
     * Send user created event
     */
    fun sendUserCreatedEvent(userId: String, userData: Map<String, Any>) {
        val event = UserEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = UserEventType.USER_CREATED,
            userId = userId,
            data = userData
        )
        sendUserEvent(event)
    }
    
    /**
     * Send user updated event
     */
    fun sendUserUpdatedEvent(userId: String, userData: Map<String, Any>) {
        val event = UserEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = UserEventType.USER_UPDATED,
            userId = userId,
            data = userData
        )
        sendUserEvent(event)
    }
    
    /**
     * Send login success event
     */
    fun sendLoginSuccessEvent(userId: String, sessionId: String, ipAddress: String?, userAgent: String?) {
        val event = AuthEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = com.starboy99.shareprintoauthentificationbackend.event.AuthEventType.LOGIN_SUCCESS,
            userId = userId,
            sessionId = sessionId,
            ipAddress = ipAddress,
            userAgent = userAgent
        )
        sendAuthEvent(event)
    }
    
    /**
     * Send login failed event
     */
    fun sendLoginFailedEvent(userId: String?, ipAddress: String?, userAgent: String?, reason: String) {
        val event = AuthEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = com.starboy99.shareprintoauthentificationbackend.event.AuthEventType.LOGIN_FAILED,
            userId = userId,
            sessionId = null,
            ipAddress = ipAddress,
            userAgent = userAgent,
            data = mapOf("reason" to reason)
        )
        sendAuthEvent(event)
    }
    
    /**
     * Send logout event
     */
    fun sendLogoutEvent(userId: String, sessionId: String? = null) {
        val event = AuthEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = com.starboy99.shareprintoauthentificationbackend.event.AuthEventType.LOGOUT,
            userId = userId,
            sessionId = sessionId ?: ""
        )
        sendAuthEvent(event)
    }
    
    /**
     * Send printer added event
     */
    fun sendPrinterAddedEvent(userId: String, printerData: Map<String, Any>) {
        val event = UserEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = UserEventType.PRINTER_ADDED,
            userId = userId,
            data = printerData
        )
        sendUserEvent(event)
    }
    
    /**
     * Send printer updated event
     */
    fun sendPrinterUpdatedEvent(userId: String, printerData: Map<String, Any>) {
        val event = UserEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = UserEventType.PRINTER_UPDATED,
            userId = userId,
            data = printerData
        )
        sendUserEvent(event)
    }
    
    /**
     * Send printer deleted event
     */
    fun sendPrinterDeletedEvent(userId: String, printerId: String) {
        val event = UserEvent(
            eventId = java.util.UUID.randomUUID().toString(),
            eventType = UserEventType.PRINTER_DELETED,
            userId = userId,
            data = mapOf("printerId" to printerId)
        )
        sendUserEvent(event)
    }
    
    /**
     * Send user login event to User-login-topic
     */
    fun sendUserLoginEvent(user: User): CompletableFuture<SendResult<String, Any>> {
        logger.info("🚀 Sending user login event for user: ${user.userId} to topic: $userLoginTopic")
        
        return kafkaTemplate.send(userLoginTopic, user.userId, user)
            .whenComplete { result, throwable ->
                if (throwable != null) {
                    logger.error("❌ Failed to send user login event for user: ${user.userId}", throwable)
                } else {
                    logger.info("✅ Successfully sent user login event for user: ${user.userId} to topic: ${result.recordMetadata.topic()}")
                }
            }
    }
    
    fun sendSimpleMessage(topic: String, key: String, message: String): CompletableFuture<SendResult<String, Any>> {
        logger.info("🧪 Sending simple message to topic: $topic")
        return kafkaTemplate.send(topic, key, message)
            .whenComplete { result, throwable ->
                if (throwable != null) {
                    logger.error("❌ Failed to send simple message to topic: $topic", throwable)
                } else {
                    logger.info("✅ Successfully sent simple message to topic: ${result.recordMetadata.topic()}")
                }
            }
    }
}

