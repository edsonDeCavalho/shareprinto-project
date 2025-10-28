package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.mongodb.core.mapping.Field

data class FileSize(
    @Field("value")
    val value: Long,
    
    @Field("unit")
    val unit: String // 'bytes', 'KB', 'MB', 'GB'
)

