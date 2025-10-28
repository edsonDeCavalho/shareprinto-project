package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import java.time.LocalDateTime

@Document(collection = "orders")
data class Order(
    @Id
    val id: String? = "",
    
    @Field("orderID")
    @Indexed(unique = true)
    val orderID: String? = "",
    
    @Field("createdAt")
    @Indexed
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Field("userCreatorID")
    @Indexed
    val userCreatorID: String ="",
    
    @Field("locationData")
    val locationData: LocationData = LocationData() ,
    
    @Field("multiplePrints")
    val multiplePrints: Boolean = false,
    
    @Field("numberOfPrints")
    val numberOfPrints: Int = 0,
    
    @Field("listOfFilesToPrint")
    val listOfFilesToPrint: List<FileToPrint>,
    
    @Field("status")
    @Indexed
    val status: OrderStatus = OrderStatus.PENDING,
    
    @Field("progressPercentage")
    val progressPercentage: Int = 0,
    
    @Field("materialType")
    @Indexed
    val materialType: String = "",
    
    @Field("typeOfPrinting")
    @Indexed
    val typeOfPrinting: String = "",
    
    @Field("description")
    val description: String = "",
    
    @Field("instructions")
    val instructions: String = "",
    
    @Field("chatID")
    val chatID: String? = "",
    
    @Field("estimatedTime")
    val estimatedTime: Int =0, // in minutes
    
    @Field("finishedTime")
    val finishedTime: LocalDateTime? = LocalDateTime.now(),
    
    @Field("typeOfDelivery")
    @Indexed
    val typeOfDelivery: DeliveryType = DeliveryType.IN_PERSON,
    
    @Field("deliveryDetails")
    val deliveryDetails: DeliveryDetails? = DeliveryDetails(),
    
    @Field("cost")
    val cost: Double = 0.0,
    
    @Field("recuperationCode")
    @Indexed(unique = true)
    val recuperationCode: Int? = 0,
    
    @Field("assignedFarmerID")
    @Indexed
    val assignedFarmerID: String? = "",
    
    @Field("acceptedAt")
    val acceptedAt: LocalDateTime? = LocalDateTime.now(),
    
    @Field("startedAt")
    val startedAt: LocalDateTime? = LocalDateTime.now(),
    
    @Field("completedAt")
    val completedAt: LocalDateTime? = LocalDateTime.now(),
    
    @Field("cancelledAt")
    val cancelledAt: LocalDateTime? = LocalDateTime.now(),
    
    @Field("cancellationReason")
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

