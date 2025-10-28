package com.starboy99.shareprintoordersbackend.model



data class FileMetadata(

    val originalName: String,
    val checksum: String,

    val tags: List<String>
)
