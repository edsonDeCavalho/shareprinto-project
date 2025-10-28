package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.mongodb.core.mapping.Field

data class PickupLocation(
    @Field("address")
    val address: String = "",
    
    @Field("latitude")
    val latitude: Double = 0.0,
    
    @Field("longitude")
    val longitude: Double = 0.0,
    
    @Field("city")
    val city: String = "",
    
    @Field("postalCode")
    val postalCode: String = ""
)

