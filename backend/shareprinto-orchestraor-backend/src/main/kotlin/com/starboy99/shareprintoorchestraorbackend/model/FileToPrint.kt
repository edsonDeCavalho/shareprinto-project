package com.starboy99.shareprintoorchestraorbackend.model


import java.time.LocalDateTime

data class FileToPrint(
    val id: String? = null,
    val orderId: String? = null,
    val userId: String,
    val fileName: String,
    val fileAddress: String,
    val uploadTime: LocalDateTime,
    val size: FileSize,
    val extension: String,
    val mimeType: String,
    val previews: List<FilePreview>,
    val metadata: FileMetadata
)
