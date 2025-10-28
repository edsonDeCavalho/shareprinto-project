package com.starboy99.shareprintoorchestraorbackend.service

import com.starboy99.shareprintoordersbackend.model.Order
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/orders")
class OrderController(
    private val kafkaOrdersService: KafkaOrderervice
) {
    @CrossOrigin(origins = ["*"])
    @PostMapping("/send")
    fun sendOrder(@RequestBody order: Order): String {
        //Verification token



        kafkaOrdersService.sendToCreatOrder(order)
        return "✅ Order ${order.id} sent to order-backend!"
    }
}