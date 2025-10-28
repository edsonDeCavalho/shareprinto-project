package com.starboy99.shareprintoordersbackend.dto

import com.starboy99.shareprintoordersbackend.model.OrderStatus
import java.time.LocalDateTime

data class UpdateOrderRequest(
    val status: OrderStatus? = null,
    val progressPercentage: Int? = null,
    val assignedFarmerID: String? = null,
    val acceptedAt: LocalDateTime? = null,
    val startedAt: LocalDateTime? = null,
    val completedAt: LocalDateTime? = null,
    val cancelledAt: LocalDateTime? = null,
    val cancellationReason: String? = null,
    val finishedTime: LocalDateTime? = null,
    val chatID: String? = null
)

