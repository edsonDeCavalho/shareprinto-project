package com.starboy99.shareprintoordersbackend.dto

import com.starboy99.shareprintoordersbackend.model.DeliveryType
import com.starboy99.shareprintoordersbackend.model.OrderStatus
import java.time.LocalDateTime

data class OrderQuery(
    val userCreatorID: String? = null,
    val assignedFarmerID: String? = null,
    val status: OrderStatus? = null,
    val city: String? = null,
    val materialType: String? = null,
    val typeOfPrinting: String? = null,
    val typeOfDelivery: DeliveryType? = null,
    val dateFrom: LocalDateTime? = null,
    val dateTo: LocalDateTime? = null,
    val limit: Int = 20,
    val offset: Int = 0
)

