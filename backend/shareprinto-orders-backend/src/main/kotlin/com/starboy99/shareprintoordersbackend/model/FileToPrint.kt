package com.starboy99.shareprintoordersbackend.model

import org.springframework.data.mongodb.core.mapping.Field
import java.time.LocalDateTime

data class FileToPrint(
    @Field("id")
    val id: String? = null,
    
    @Field("orderId")
    val orderId: String? = null,
    
    @Field("userId")
    val userId: String,
    
    @Field("fileName")
    val fileName: String,
    
    @Field("fileAddress")
    val fileAddress: String,
    
    @Field("uploadTime")
    val uploadTime: LocalDateTime,
    
    @Field("size")
    val size: FileSize,
    
    @Field("extension")
    val extension: String,
    
    @Field("mimeType")
    val mimeType: String,
    
    @Field("previews")
    val previews: List<FilePreview>,
    
    @Field("metadata")
    val metadata: FileMetadata
)

