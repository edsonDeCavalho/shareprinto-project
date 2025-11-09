package com.starboy99.shareprintoorchestraorbackend.model

enum class OrderStatus {
    PENDING,
    ACCEPTED,
    IN_PROGRESS,
    PAUSED,
    PAUSED_DUE_TO_PROBLEM_PRINTING,
    FINISHED,
    CANCELLED
}
