package com.starboy99.shareprintoorchestraorbackend.service

import com.starboy99.shareprintoorchestraorbackend.model.Order
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service

/**
 * KafkaTestService
 */
@Service
class KafkaOrderervice(
    private val kafkaTemplate: KafkaTemplate<String, Order>
) {
    private val topic = "orders-topic"


    fun sendToCreatOrder(order: Order) {
        println("✅ Sending message orders")
        kafkaTemplate.send(topic, order)
    }
}