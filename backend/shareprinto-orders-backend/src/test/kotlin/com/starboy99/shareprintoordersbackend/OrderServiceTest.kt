package com.starboy99.shareprintoordersbackend

import com.starboy99.shareprintoordersbackend.dto.CreateOrderRequest
import com.starboy99.shareprintoordersbackend.model.*
import com.starboy99.shareprintoordersbackend.repository.OrderRepository
import com.starboy99.shareprintoordersbackend.service.OrderService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import java.time.LocalDateTime

class OrderServiceTest {
    
    private val orderRepository = mock<OrderRepository>()
    private val orderService = OrderService(orderRepository)
    
    @Test
    fun `should create order successfully`() {
        // Given
        val request = CreateOrderRequest(
            userCreatorID = "user123",
            locationData = LocationData(48.8566, 2.3522, "Paris"),
            numberOfPrints = 1,
            listOfFilesToPrint = listOf(
                FileToPrint(
                    userId = "user123",
                    fileName = "test.pdf",
                    fileAddress = "/files/test.pdf",
                    uploadTime = LocalDateTime.now(),
                    size = FileSize(1024, "KB"),
                    extension = "pdf",
                    mimeType = "application/pdf",
                    previews = emptyList(),
                    metadata = FileMetadata("test.pdf", "checksum123", emptyList())
                )
            ),
            materialType = "Paper",
            typeOfPrinting = "Black & White",
            description = "Test order",
            instructions = "Print on A4",
            estimatedTime = 30,
            typeOfDelivery = DeliveryType.IN_PERSON,
            cost = 5.0
        )
        
        val savedOrder = Order(
            id = "order_id_123",
            orderID = "order_1234567890_abc123",
            userCreatorID = "user123",
            locationData = request.locationData,
            numberOfPrints = 1,
            listOfFilesToPrint = request.listOfFilesToPrint,
            materialType = "Paper",
            typeOfPrinting = "Black & White",
            description = "Test order",
            instructions = "Print on A4",
            estimatedTime = 30,
            typeOfDelivery = DeliveryType.IN_PERSON,
            cost = 5.0,
            recuperationCode = 1234
        )
        
        `when`(orderRepository.save(any<Order>())).thenReturn(savedOrder)
        
        // When
        val result = orderService.createOrder(request)
        
        // Then
        assertNotNull(result)
        assertEquals("user123", result.userCreatorID)
        assertEquals("Paper", result.materialType)
        assertEquals(OrderStatus.PENDING, result.status)
        verify(orderRepository, times(2)).save(any<Order>())
    }
    
    @Test
    fun `should get order by ID`() {
        // Given
        val orderId = "order_1234567890_abc123"
        val order = Order(
            id = "order_id_123",
            orderID = orderId,
            userCreatorID = "user123",
            locationData = LocationData(48.8566, 2.3522, "Paris"),
            numberOfPrints = 1,
            listOfFilesToPrint = emptyList(),
            materialType = "Paper",
            typeOfPrinting = "Black & White",
            description = "Test order",
            instructions = "Print on A4",
            estimatedTime = 30,
            typeOfDelivery = DeliveryType.IN_PERSON,
            cost = 5.0
        )
        
        `when`(orderRepository.findByOrderID(orderId)).thenReturn(order)
        
        // When
        val result = orderService.getOrderById(orderId)
        
        // Then
        assertNotNull(result)
        assertEquals(orderId, result?.orderID)
        assertEquals("user123", result?.userCreatorID)
    }
    
    @Test
    fun `should return null when order not found`() {
        // Given
        val orderId = "non_existent_order"
        `when`(orderRepository.findByOrderID(orderId)).thenReturn(null)
        
        // When
        val result = orderService.getOrderById(orderId)
        
        // Then
        assertNull(result)
    }
}
