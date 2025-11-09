package com.starboy99.shareprintoorchestraorbackend.model

import java.time.LocalDateTime

data class DeliveryDetails(
    val pickupLocation: PickupLocation = PickupLocation(),
    val pickupTime: LocalDateTime = LocalDateTime.now(),
    val contactPerson: String = "",
    val contactNumber: String = ""
)
