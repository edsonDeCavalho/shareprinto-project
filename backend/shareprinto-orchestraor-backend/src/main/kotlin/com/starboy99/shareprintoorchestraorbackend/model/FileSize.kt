package com.starboy99.shareprintoorchestraorbackend.model


data class FileSize(
    val value: Long,
    val unit: String // 'bytes', 'KB', 'MB', 'GB'
)
