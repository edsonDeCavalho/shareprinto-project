package com.starboy99.shareprintoauthentificationbackend.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.index.Indexed
import java.time.LocalDateTime

@Document(collection = "otps")
data class Otp(
    @Id
    val id: String? = null,
    @Indexed
    val phone: String,
    val code: String,
    val verified: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
