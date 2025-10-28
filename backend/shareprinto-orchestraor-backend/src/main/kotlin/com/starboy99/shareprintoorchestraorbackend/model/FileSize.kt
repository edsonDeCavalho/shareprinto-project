package com.starboy99.shareprintoordersbackend.model


data class FileSize(
    val value: Long,
    val unit: String // 'bytes', 'KB', 'MB', 'GB'
)
