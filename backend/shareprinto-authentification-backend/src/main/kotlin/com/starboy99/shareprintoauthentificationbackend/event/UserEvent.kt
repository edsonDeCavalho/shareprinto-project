package com.starboy99.shareprintoauthentificationbackend.event

import java.time.LocalDateTime

data class UserEvent(
    val eventId: String,
    val eventType: UserEventType,
    val userId: String,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val data: Map<String, Any> = emptyMap()
)

enum class UserEventType {
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
    USER_LOGIN,
    USER_LOGOUT,
    USER_VERIFIED,
    USER_BLOCKED,
    USER_UNBLOCKED,
    PASSWORD_CHANGED,
    EMAIL_CHANGED,
    PROFILE_UPDATED,
    PRINTER_ADDED,
    PRINTER_UPDATED,
    PRINTER_DELETED,
    PRINTER_STATUS_CHANGED
}
