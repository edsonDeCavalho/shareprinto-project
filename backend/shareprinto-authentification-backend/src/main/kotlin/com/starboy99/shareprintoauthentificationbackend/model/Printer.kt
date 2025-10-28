package com.starboy99.shareprintoauthentificationbackend.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

data class Printer(
    val printerId: String,
    val printerBrand: String,
    val printerModel: String,
    val buildVolume: String,
    val multiColor: Boolean,
    val online: Boolean = true
)
