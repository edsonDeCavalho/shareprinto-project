package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.mongodb.core.mapping.Field
import java.time.LocalDateTime

data class DeliveryDetails(
    @Field("pickupLocation")
    val pickupLocation: PickupLocation = PickupLocation(),
    
    @Field("pickupTime")
    val pickupTime: LocalDateTime = LocalDateTime.now(),
    
    @Field("contactPerson")
    val contactPerson: String = "",
    
    @Field("contactNumber")
    val contactNumber: String = ""
)

