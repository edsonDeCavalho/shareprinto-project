package com.starboy99.shareprintoorchestraorbackend.model

import java.time.LocalDateTime

data class User(
    val id: String? = null,
    val userId: String,
    val phone: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val userType: String? = null,
    val avatar: String? = null,
    val digitalCode: String? = null,
    val password: String? = null,
    val username: String? = null,
    val adresseID: String? = null,
    val country: String? = null,
    val type: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zipCode: String? = null,
    val printerBrand: String? = null,
    val printerModel: String? = null,
    val buildVolume: String? = null,
    val multiColor: Boolean? = null,
    val printerPhotos: List<String>? = null,
    val printers: List<Printer>? = null,
    val score: Double = 0.0,
    val online: Boolean = false,
    val activated: Boolean = false,
    val available: Boolean = false,
    val latSeenAt: LocalDateTime? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    val lastSeenAt: LocalDateTime? = null
)

data class Printer(
    val printerId: String,
    val printerBrand: String,
    val printerModel: String,
    val buildVolume: String,
    val multiColor: Boolean,
    val online: Boolean = true
)
