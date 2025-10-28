package com.starboy99.shareprintoorchestraorbackend.service

import com.starboy99.shareprintoorchestraorbackend.model.User
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.KafkaHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Service
import java.util.concurrent.CopyOnWriteArrayList

@Service
class UserLoginConsumerService {
    
    private val logger = LoggerFactory.getLogger(UserLoginConsumerService::class.java)
    
    // Thread-safe list to store users from User-login-topic
    private val loggedInUsers: MutableList<User> = CopyOnWriteArrayList()
    
    @Value("\${kafka.topics.user-login-topic}")
    private lateinit var userLoginTopic: String
    
    /**
     * Listen to user login events from User-login-topic
     * This consumer stores the user structure in a list as requested
     */
    @KafkaListener(
        topics = ["\${kafka.topics.user-login-topic}"], 
        groupId = "sharePrinto",
        containerFactory = "userLoginKafkaListenerContainerFactory"
    )
    fun handleUserLoginEvent(
        @Payload user: User,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String,
        @Header(KafkaHeaders.RECEIVED_PARTITION) partition: Int,
        @Header(KafkaHeaders.OFFSET) offset: Long
    ) {
        println("✅resive user login: ${user.userId}")
        logger.info("Received user login event from topic: $topic, partition: $partition, offset: $offset")
        logger.info("User logged in: ${user.userId} (${user.firstName} ${user.lastName})")
        
        // Store the user in the list
        loggedInUsers.add(user)
        
        logger.info("User ${user.userId} added to logged-in users list. Total users: ${loggedInUsers.size}")
    }
    
    /**
     * Get all logged-in users
     */
    fun getLoggedInUsers(): List<User> {
        return loggedInUsers.toList()
    }
    
    /**
     * Get logged-in user by ID
     */
    fun getLoggedInUser(userId: String): User? {
        return loggedInUsers.find { it.userId == userId }
    }
    
    /**
     * Remove user from logged-in users list (for logout)
     */
    fun removeLoggedInUser(userId: String): Boolean {
        val removed = loggedInUsers.removeIf { it.userId == userId }
        if (removed) {
            logger.info("User $userId removed from logged-in users list. Total users: ${loggedInUsers.size}")
        }
        return removed
    }
    
    /**
     * Get count of logged-in users
     */
    fun getLoggedInUsersCount(): Int {
        return loggedInUsers.size
    }
    
    /**
     * Clear all logged-in users (for testing or maintenance)
     */
    fun clearLoggedInUsers() {
        val count = loggedInUsers.size
        loggedInUsers.clear()
        logger.info("Cleared all logged-in users. Removed $count users.")
    }
    
    /**
     * Listen to simple string messages for testing
     */
    @KafkaListener(topics = ["\${kafka.topics.user-login-topic}"], groupId = "sharePrinto-test")
    fun handleSimpleMessage(
        @Payload message: String,
        @Header(KafkaHeaders.RECEIVED_TOPIC) topic: String,
        @Header(KafkaHeaders.RECEIVED_PARTITION) partition: Int,
        @Header(KafkaHeaders.OFFSET) offset: Long
    ) {
        println("🧪 Received simple message: $message")
        logger.info("🧪 Received simple message from topic: $topic, partition: $partition, offset: $offset")
        logger.info("🧪 Message content: $message")
    }
}
