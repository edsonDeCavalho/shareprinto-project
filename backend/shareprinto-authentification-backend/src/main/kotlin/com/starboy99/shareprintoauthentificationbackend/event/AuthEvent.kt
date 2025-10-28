package com.starboy99.shareprintoauthentificationbackend.event

import java.time.LocalDateTime

data class AuthEvent(
    val eventId: String,
    val eventType: AuthEventType,
    val userId: String?,
    val sessionId: String?,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val ipAddress: String? = null,
    val userAgent: String? = null,
    val data: Map<String, Any> = emptyMap()
)

enum class AuthEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGOUT,
    TOKEN_REFRESHED,
    TOKEN_EXPIRED,
    TOKEN_INVALID,
    PASSWORD_RESET_REQUESTED,
    PASSWORD_RESET_COMPLETED,
    ACCOUNT_LOCKED,
    ACCOUNT_UNLOCKED,
    SESSION_EXPIRED,
    SESSION_INVALIDATED,
    MULTI_FACTOR_REQUIRED,
    MULTI_FACTOR_VERIFIED,
    MULTI_FACTOR_FAILED
}
