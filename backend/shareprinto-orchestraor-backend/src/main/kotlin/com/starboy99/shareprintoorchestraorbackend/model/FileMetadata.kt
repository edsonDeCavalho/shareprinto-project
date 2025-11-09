package com.starboy99.shareprintoorchestraorbackend.model



data class FileMetadata(

    val originalName: String,
    val checksum: String,

    val tags: List<String>
)
