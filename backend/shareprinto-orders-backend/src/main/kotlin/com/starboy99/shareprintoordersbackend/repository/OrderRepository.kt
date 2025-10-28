package com.starboy99.shareprintoordersbackend.repository

import com.starboy99.shareprintoordersbackend.model.Order
import com.starboy99.shareprintoordersbackend.model.OrderStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface OrderRepository : MongoRepository<Order, String> {
    
    // Find orders by user
    fun findByUserCreatorIDOrderByCreatedAtDesc(userCreatorID: String, pageable: Pageable): Page<Order>
    
    // Find orders by farmer
    fun findByAssignedFarmerIDOrderByCreatedAtDesc(assignedFarmerID: String, pageable: Pageable): Page<Order>
    
    // Find orders by status
    fun findByStatusOrderByCreatedAtDesc(status: OrderStatus, pageable: Pageable): Page<Order>
    
    // Find orders by city
    fun findByLocationDataCityOrderByCreatedAtDesc(city: String, pageable: Pageable): Page<Order>
    
    // Find orders by material type
    fun findByMaterialTypeOrderByCreatedAtDesc(materialType: String, pageable: Pageable): Page<Order>
    
    // Find orders by printing type
    fun findByTypeOfPrintingOrderByCreatedAtDesc(typeOfPrinting: String, pageable: Pageable): Page<Order>
    
    // Find orders by delivery type
    fun findByTypeOfDeliveryOrderByCreatedAtDesc(typeOfDelivery: String, pageable: Pageable): Page<Order>
    
    // Find orders by date range
    fun findByCreatedAtBetweenOrderByCreatedAtDesc(
        dateFrom: LocalDateTime, 
        dateTo: LocalDateTime, 
        pageable: Pageable
    ): Page<Order>
    
    // Complex query for filtering
    @Query("{ \$and: [" +
            "{ \$or: [{'userCreatorID': ?0}, { \$expr: { \$eq: [?0, null] } }] }," +
            "{ \$or: [{'assignedFarmerID': ?1}, { \$expr: { \$eq: [?1, null] } }] }," +
            "{ \$or: [{'status': ?2}, { \$expr: { \$eq: [?2, null] } }] }," +
            "{ \$or: [{'locationData.city': ?3}, { \$expr: { \$eq: [?3, null] } }] }," +
            "{ \$or: [{'materialType': ?4}, { \$expr: { \$eq: [?4, null] } }] }," +
            "{ \$or: [{'typeOfPrinting': ?5}, { \$expr: { \$eq: [?5, null] } }] }," +
            "{ \$or: [{'typeOfDelivery': ?6}, { \$expr: { \$eq: [?6, null] } }] }," +
            "{ \$or: [{'createdAt': {\$gte: ?7}}, { \$expr: { \$eq: [?7, null] } }] }," +
            "{ \$or: [{'createdAt': {\$lte: ?8}}, { \$expr: { \$eq: [?8, null] } }] }" +
            "] }")
    fun findOrdersWithFilters(
        userCreatorID: String?,
        assignedFarmerID: String?,
        status: String?,
        city: String?,
        materialType: String?,
        typeOfPrinting: String?,
        typeOfDelivery: String?,
        dateFrom: LocalDateTime?,
        dateTo: LocalDateTime?,
        pageable: Pageable
    ): Page<Order>
    
    // Count orders by status
    fun countByStatus(status: OrderStatus): Long
    
    // Count orders by user
    fun countByUserCreatorID(userCreatorID: String): Long
    
    // Count orders by farmer
    fun countByAssignedFarmerID(assignedFarmerID: String): Long
    
    // Find orders by orderID
    fun findByOrderID(orderID: String): Order?
    
    // Find orders by recuperation code
    fun findByRecuperationCode(recuperationCode: Int): Order?
    
    // Find pending orders for a specific city
    fun findByStatusAndLocationDataCityOrderByCreatedAtAsc(
        status: OrderStatus, 
        city: String
    ): List<Order>
    
    // Find orders that can be assigned to farmers
    fun findByStatusAndAssignedFarmerIDIsNullOrderByCreatedAtAsc(
        status: OrderStatus
    ): List<Order>
}

