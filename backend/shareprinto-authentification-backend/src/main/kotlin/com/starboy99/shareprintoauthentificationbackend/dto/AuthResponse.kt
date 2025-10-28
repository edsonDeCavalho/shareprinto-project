package com.starboy99.shareprintoauthentificationbackend.dto

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val token: String? = null,
    val user: UserDto? = null,
    val users: List<UserDto>? = null,
    val farmers: List<UserDto>? = null,
    val data: Any? = null
)

data class UserDto(
    val id: String? = null,
    val userId: String? = null,
    val phone: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val userType: String? = null,
    val avatar: String? = null,
    val score: Double? = null,
    val online: Boolean? = null,
    val available: Boolean? = null,
    val activated: Boolean? = null,
    val printers: List<PrinterDto>? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zipCode: String? = null,
    val country: String? = null,
    val createdAt: String? = null,
    val lastSeenAt: String? = null
)
