package com.starboy99.shareprintoordersbackend.dto

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)

data class PaginatedResponse<T>(
    val success: Boolean,
    val data: List<T>,
    val pagination: PaginationInfo
)

data class PaginationInfo(
    val total: Long,
    val limit: Int,
    val offset: Int,
    val hasMore: Boolean
)

