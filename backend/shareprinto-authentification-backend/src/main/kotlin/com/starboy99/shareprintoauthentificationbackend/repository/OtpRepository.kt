package com.starboy99.shareprintoauthentificationbackend.repository

import com.starboy99.shareprintoauthentificationbackend.model.Otp
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface OtpRepository : MongoRepository<Otp, String> {
    fun findByPhoneAndCodeAndVerifiedFalse(phone: String, code: String): Otp?
}
