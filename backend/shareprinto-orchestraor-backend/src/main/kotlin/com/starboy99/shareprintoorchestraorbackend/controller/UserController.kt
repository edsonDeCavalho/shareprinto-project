package com.starboy99.shareprintoorchestraorbackend.controller

import com.starboy99.shareprintoorchestraorbackend.model.User
import com.starboy99.shareprintoorchestraorbackend.service.UserLoginConsumerService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userLoginConsumerService: UserLoginConsumerService
) {
    
    /**
     * Get all logged-in users
     */
    @GetMapping("/logged-in")
    fun getLoggedInUsers(): ResponseEntity<List<User>> {
        val users = userLoginConsumerService.getLoggedInUsers()
        return ResponseEntity.ok(users)
    }
    
    /**
     * Get logged-in user by ID
     */
    @GetMapping("/logged-in/{userId}")
    fun getLoggedInUser(@PathVariable userId: String): ResponseEntity<User?> {
        val user = userLoginConsumerService.getLoggedInUser(userId)
        return if (user != null) {
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    /**
     * Get count of logged-in users
     */
    @GetMapping("/logged-in/count")
    fun getLoggedInUsersCount(): ResponseEntity<Map<String, Int>> {
        val count = userLoginConsumerService.getLoggedInUsersCount()
        return ResponseEntity.ok(mapOf("count" to count))
    }
    
    /**
     * Remove user from logged-in users list (for logout)
     */
    @DeleteMapping("/logged-in/{userId}")
    fun removeLoggedInUser(@PathVariable userId: String): ResponseEntity<Map<String, Boolean>> {
        val removed = userLoginConsumerService.removeLoggedInUser(userId)
        return ResponseEntity.ok(mapOf("removed" to removed))
    }
    
    /**
     * Clear all logged-in users (for testing or maintenance)
     */
    @DeleteMapping("/logged-in")
    fun clearLoggedInUsers(): ResponseEntity<Map<String, String>> {
        userLoginConsumerService.clearLoggedInUsers()
        return ResponseEntity.ok(mapOf("message" to "All logged-in users cleared"))
    }
}
