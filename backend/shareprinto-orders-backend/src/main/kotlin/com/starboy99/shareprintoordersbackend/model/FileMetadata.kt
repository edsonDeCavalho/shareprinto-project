package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.mongodb.core.mapping.Field

data class FileMetadata(
    @Field("originalName")
    val originalName: String,
    
    @Field("checksum")
    val checksum: String,
    
    @Field("tags")
    val tags: List<String>
)

