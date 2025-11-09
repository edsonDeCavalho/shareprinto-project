package com.starboy99.shareprintoorchestraorbackend.model


data class FilePreview(

    val previewId: String,

    val address: String,

    val type: String, // 'image', 'video', 'pdf'

    val width: Int,

    val height: Int,

    val duration: Int = 0 // for videos
)
