package com.starboy99.shareprintoordersbackend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.starboy99.shareprintoordersbackend.model.Order
import jakarta.annotation.PostConstruct
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
@Service
class KafkaOrdersService(
    private val kafkaTemplate: KafkaTemplate<String, Order>
) {
    private val topic = "orders-topic"
    @KafkaListener(topics = ["orders-topic"], groupId = "sharePrinto")
    fun listen(order: Order) {
        println("🎉 Received order from Core: ${order.orderID}")
    }
}
