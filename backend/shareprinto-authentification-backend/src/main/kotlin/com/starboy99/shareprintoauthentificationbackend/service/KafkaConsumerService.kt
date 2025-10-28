package com.starboy99.shareprintoauthentificationbackend.service

import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.KafkaHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Service

@Service
class KafkaConsumerService {
    
    private val logger = LoggerFactory.getLogger(KafkaConsumerService::class.java)
    
    /**
     * Listen to order events from the orders service
     */
    @KafkaListener(topics = ["\${kafka.topics.order-events}"], groupId = "shareprinto-auth")
    fun handleOrderEvent(
        @Payload orderData: Map<String, Any>,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String,
        @Header(KafkaHeaders.RECEIVED_PARTITION) partition: Int,
        @Header(KafkaHeaders.OFFSET) offset: Long
    ) {
        logger.info("Received order event from topic: $topic, partition: $partition, offset: $offset")
        logger.info("Order data: $orderData")
        
        val orderId = orderData["orderID"] as? String
        val userId = orderData["userCreatorID"] as? String
        val status = orderData["status"] as? String
        
        // Handle order events based on status
        when (status) {
            "PENDING" -> {
                logger.info("Order $orderId is pending - no action needed for auth service")
            }
            "ACCEPTED" -> {
                val assignedFarmerId = orderData["assignedFarmerID"] as? String
                logger.info("Order $orderId accepted by farmer $assignedFarmerId")
                // Could trigger notifications to user about order acceptance
            }
            "IN_PROGRESS" -> {
                val assignedFarmerId = orderData["assignedFarmerID"] as? String
                logger.info("Order $orderId started by farmer $assignedFarmerId")
                // Could trigger notifications to user about order progress
            }
            "FINISHED" -> {
                val assignedFarmerId = orderData["assignedFarmerID"] as? String
                logger.info("Order $orderId completed by farmer $assignedFarmerId")
                // Could trigger notifications to user about order completion
            }
            "CANCELLED" -> {
                val cancellationReason = orderData["cancellationReason"] as? String
                logger.info("Order $orderId cancelled - reason: $cancellationReason")
                // Could trigger notifications to user about order cancellation
            }
            else -> {
                logger.info("Order $orderId status changed to $status")
            }
        }
    }
    
    /**
     * Listen to general events (can be extended for other services)
     */
    @KafkaListener(topics = ["general-events"], groupId = "shareprinto-auth")
    fun handleGeneralEvent(
        @Payload message: String,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String,
        @Header(KafkaHeaders.RECEIVED_PARTITION) partition: Int,
        @Header(KafkaHeaders.OFFSET) offset: Long
    ) {
        logger.info("Received general event from topic: $topic, partition: $partition, offset: $offset")
        logger.info("Message: $message")
        
        // Handle general events from other services
        // This could include system-wide notifications, maintenance events, etc.
    }
    
    /**
     * Listen to user events from other services (if any)
     */
    @KafkaListener(topics = ["user-events"], groupId = "shareprinto-auth")
    fun handleUserEvent(
        @Payload userEvent: Map<String, Any>,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String,
        @Header(KafkaHeaders.RECEIVED_PARTITION) partition: Int,
        @Header(KafkaHeaders.OFFSET) offset: Long
    ) {
        logger.info("Received user event from topic: $topic, partition: $partition, offset: $offset")
        logger.info("User event: $userEvent")
        
        // Handle user events from other services
        // This could include user updates from external systems, etc.
    }
    
}
