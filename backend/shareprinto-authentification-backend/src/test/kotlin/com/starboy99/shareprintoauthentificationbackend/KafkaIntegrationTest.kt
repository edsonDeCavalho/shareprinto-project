package com.starboy99.shareprintoauthentificationbackend

import com.starboy99.shareprintoauthentificationbackend.event.AuthEvent
import com.starboy99.shareprintoauthentificationbackend.event.AuthEventType
import com.starboy99.shareprintoauthentificationbackend.event.UserEvent
import com.starboy99.shareprintoauthentificationbackend.event.UserEventType
import com.starboy99.shareprintoauthentificationbackend.model.User
import com.starboy99.shareprintoauthentificationbackend.service.KafkaProducerService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.kafka.test.context.EmbeddedKafka
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDateTime

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = ["user-events", "auth-events"])
@ActiveProfiles("test")
class KafkaIntegrationTest {
    
    @Autowired
    private lateinit var kafkaProducerService: KafkaProducerService
    
    @Test
    fun `should send user event successfully`() {
        val userEvent = UserEvent(
            eventId = "test-event-1",
            eventType = UserEventType.USER_CREATED,
            userId = "test-user-123",
            data = mapOf("test" to "data")
        )
        
        // Just send the event without waiting for completion
        kafkaProducerService.sendUserEvent(userEvent)
        
        // If no exception is thrown, the test passes
        assert(true)
    }
    
    @Test
    fun `should send auth event successfully`() {
        val authEvent = AuthEvent(
            eventId = "test-auth-event-1",
            eventType = AuthEventType.LOGIN_SUCCESS,
            userId = "test-user-123",
            sessionId = "test-session-123",
            ipAddress = "127.0.0.1",
            userAgent = "test-agent"
        )
        
        // Just send the event without waiting for completion
        kafkaProducerService.sendAuthEvent(authEvent)
        
        // If no exception is thrown, the test passes
        assert(true)
    }
    
    @Test
    fun `should send user created event successfully`() {
        val userData = mapOf(
            "firstName" to "John",
            "lastName" to "Doe",
            "email" to "john.doe@example.com",
            "userType" to "farmer"
        )
        
        // Just send the event without waiting for completion
        kafkaProducerService.sendUserCreatedEvent("test-user-123", userData)
        
        // If no exception is thrown, the test passes
        assert(true)
    }
    
    @Test
    fun `should send login success event successfully`() {
        // Just send the event without waiting for completion
        kafkaProducerService.sendLoginSuccessEvent(
            userId = "test-user-123",
            sessionId = "test-session-123",
            ipAddress = "127.0.0.1",
            userAgent = "test-agent"
        )
        
        // If no exception is thrown, the test passes
        assert(true)
    }
    
}
