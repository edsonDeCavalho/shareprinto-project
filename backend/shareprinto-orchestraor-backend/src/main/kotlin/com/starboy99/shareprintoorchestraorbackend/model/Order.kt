package com.starboy99.shareprintoorchestraorbackend.model

import java.time.LocalDateTime


data class Order(

    val id: String? = "",

    val orderID: String? = "",

    val createdAt: LocalDateTime = LocalDateTime.now(),

    val userCreatorID: String ="",

    val locationData: LocationData = LocationData() ,

    val multiplePrints: Boolean = false,

    val numberOfPrints: Int = 0,

    val listOfFilesToPrint: List<FileToPrint>,

    val status: OrderStatus = OrderStatus.PENDING,

    val progressPercentage: Int = 0,

    val materialType: String = "",

    val typeOfPrinting: String = "",

    val description: String = "",

    val instructions: String = "",

    val chatID: String? = "",

    val estimatedTime: Int =0, // in minutes

    val finishedTime: LocalDateTime? = LocalDateTime.now(),

    val typeOfDelivery: DeliveryType = DeliveryType.IN_PERSON,

    val deliveryDetails: DeliveryDetails? = DeliveryDetails(),

    val cost: Double = 0.0,

    val recuperationCode: Int? = 0,

    val assignedFarmerID: String? = "",

    val acceptedAt: LocalDateTime? = LocalDateTime.now(),

    val startedAt: LocalDateTime? = LocalDateTime.now(),

    val completedAt: LocalDateTime? = LocalDateTime.now(),

    val cancelledAt: LocalDateTime? = LocalDateTime.now(),

    val cancellationReason: String? = ""
) {
    // Helper methods
    fun canBeCancelled(): Boolean {
        return status in listOf(OrderStatus.PENDING, OrderStatus.ACCEPTED)
    }
    
    fun canBeAccepted(): Boolean {
        return status == OrderStatus.PENDING
    }
    
    fun canBeStarted(): Boolean {
        return status == OrderStatus.ACCEPTED
    }
    
    fun canBeCompleted(): Boolean {
        return status in listOf(OrderStatus.IN_PROGRESS, OrderStatus.PAUSED)
    }
    
    fun getAgeInDays(): Long {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toDays()
    }
}
