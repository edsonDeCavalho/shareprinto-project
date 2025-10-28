package com.starboy99.shareprintoordersbackend.model


data class PickupLocation(
    val address: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val city: String = "",
    val postalCode: String = ""
)
