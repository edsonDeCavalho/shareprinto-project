package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.mongodb.core.mapping.Field

data class FilePreview(
    @Field("previewId")
    val previewId: String,
    
    @Field("address")
    val address: String,
    
    @Field("type")
    val type: String, // 'image', 'video', 'pdf'
    
    @Field("width")
    val width: Int,
    
    @Field("height")
    val height: Int,
    
    @Field("duration")
    val duration: Int = 0 // for videos
)

