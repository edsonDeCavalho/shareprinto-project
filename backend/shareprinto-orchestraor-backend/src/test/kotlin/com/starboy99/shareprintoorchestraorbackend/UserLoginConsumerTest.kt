package com.starboy99.shareprintoorchestraorbackend

import com.starboy99.shareprintoorchestraorbackend.model.User
import com.starboy99.shareprintoorchestraorbackend.model.Printer
import com.starboy99.shareprintoorchestraorbackend.service.UserLoginConsumerService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.kafka.test.context.EmbeddedKafka
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDateTime

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = ["User-login-topic"])
@ActiveProfiles("test")
class UserLoginConsumerTest {
    
    @Autowired
    private lateinit var userLoginConsumerService: UserLoginConsumerService
    
    private lateinit var testUser: User
    
    @BeforeEach
    fun setUp() {
        testUser = User(
            id = "test-user-123",
            userId = "test-user-123",
            phone = "+1234567890",
            firstName = "John",
            lastName = "Doe",
            email = "john.doe@example.com",
            userType = "farmer",
            address = "123 Test Street, Test City, TC 12345",
            activated = true,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            printers = emptyList()
        )
    }
    
    @Test
    fun `should initialize with empty user list`() {
        // Clear any existing users
        userLoginConsumerService.clearLoggedInUsers()
        
        // Verify the list is empty
        val loggedInUsers = userLoginConsumerService.getLoggedInUsers()
        assert(loggedInUsers.isEmpty())
        assert(userLoginConsumerService.getLoggedInUsersCount() == 0)
    }
    
    @Test
    fun `should handle user operations correctly`() {
        // Clear any existing users
        userLoginConsumerService.clearLoggedInUsers()
        
        // Test adding a user manually (simulating what the consumer would do)
        // Note: In a real test, we would send a Kafka message, but for unit testing
        // we can test the service methods directly
        
        // Simulate what the consumer does
        userLoginConsumerService.handleUserLoginEvent(
            user = testUser,
            topic = "User-login-topic",
            partition = 0,
            offset = 0L
        )
        
        // Verify the user was stored
        val loggedInUsers = userLoginConsumerService.getLoggedInUsers()
        assert(loggedInUsers.size == 1)
        assert(loggedInUsers[0].userId == testUser.userId)
        assert(loggedInUsers[0].firstName == testUser.firstName)
        assert(loggedInUsers[0].lastName == testUser.lastName)
        
        // Test getting user by ID
        val foundUser = userLoginConsumerService.getLoggedInUser(testUser.userId)
        assert(foundUser != null)
        assert(foundUser?.firstName == testUser.firstName)
        
        // Test count
        assert(userLoginConsumerService.getLoggedInUsersCount() == 1)
        
        // Test removing user
        val removed = userLoginConsumerService.removeLoggedInUser(testUser.userId)
        assert(removed)
        assert(userLoginConsumerService.getLoggedInUsersCount() == 0)
        
        // Test removing non-existent user
        val notRemoved = userLoginConsumerService.removeLoggedInUser("non-existent")
        assert(!notRemoved)
    }
    
    @Test
    fun `should handle multiple users correctly`() {
        // Clear any existing users
        userLoginConsumerService.clearLoggedInUsers()
        
        val users = listOf(
            User(
                id = "user-1",
                userId = "user-1",
                phone = "+1111111111",
                firstName = "Alice",
                lastName = "Smith",
                email = "alice@example.com",
                userType = "farmer",
                activated = true,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                printers = emptyList()
            ),
            User(
                id = "user-2",
                userId = "user-2",
                phone = "+2222222222",
                firstName = "Bob",
                lastName = "Johnson",
                email = "bob@example.com",
                userType = "customer",
                activated = true,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                printers = emptyList()
            )
        )
        
        // Add multiple users
        users.forEach { user ->
            userLoginConsumerService.handleUserLoginEvent(
                user = user,
                topic = "User-login-topic",
                partition = 0,
                offset = 0L
            )
        }
        
        // Verify all users were stored
        val loggedInUsers = userLoginConsumerService.getLoggedInUsers()
        assert(loggedInUsers.size == 2)
        
        // Verify we can find specific users
        val alice = userLoginConsumerService.getLoggedInUser("user-1")
        assert(alice != null)
        assert(alice?.firstName == "Alice")
        
        val bob = userLoginConsumerService.getLoggedInUser("user-2")
        assert(bob != null)
        assert(bob?.firstName == "Bob")
        
        // Verify count
        assert(userLoginConsumerService.getLoggedInUsersCount() == 2)
    }
}
