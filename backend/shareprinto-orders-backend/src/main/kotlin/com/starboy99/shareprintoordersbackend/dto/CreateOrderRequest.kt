package com.starboy99.shareprintoordersbackend.dto

import com.starboy99.shareprintoordersbackend.model.DeliveryDetails
import com.starboy99.shareprintoordersbackend.model.DeliveryType
import com.starboy99.shareprintoordersbackend.model.FileToPrint
import com.starboy99.shareprintoordersbackend.model.LocationData

data class CreateOrderRequest(
    val userCreatorID: String,
    val locationData: LocationData,
    val multiplePrints: Boolean = false,
    val numberOfPrints: Int,
    val listOfFilesToPrint: List<FileToPrint>,
    val materialType: String,
    val typeOfPrinting: String,
    val description: String,
    val instructions: String,
    val estimatedTime: Int,
    val typeOfDelivery: DeliveryType,
    val deliveryDetails: DeliveryDetails? = null,
    val cost: Double
)

