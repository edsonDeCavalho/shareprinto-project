package com.starboy99.shareprintoauthentificationbackend.repository

import com.starboy99.shareprintoauthentificationbackend.model.User
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : MongoRepository<User, String> {
    fun findByPhone(phone: String): User?
    fun findByEmail(email: String): User?
    fun findByUserId(userId: String): User?
    fun findByUserTypeAndActivatedTrue(userType: String): List<User>
    fun findByUserTypeAndActivatedTrueAndCityContainingIgnoreCase(userType: String, city: String): List<User>
    fun findByActivatedTrue(): List<User>
}
