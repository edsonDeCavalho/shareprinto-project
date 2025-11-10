package com.starboy99.shareprintoauthentificationbackend.controller

import com.starboy99.shareprintoauthentificationbackend.dto.AuthResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)
    
    @ExceptionHandler(Exception::class)
    fun handleException(e: Exception): ResponseEntity<AuthResponse> {
        logger.error("❌ Unhandled exception: ${e.message}", e)
        logger.error("Stack trace:", e)
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(AuthResponse(
                success = false,
                message = "Internal server error: ${e.message ?: "Unknown error"}"
            ))
    }
    
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(e: IllegalArgumentException): ResponseEntity<AuthResponse> {
        logger.error("❌ Invalid argument: ${e.message}", e)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(AuthResponse(
                success = false,
                message = "Invalid request: ${e.message ?: "Bad request"}"
            ))
    }
    
    @ExceptionHandler(NullPointerException::class)
    fun handleNullPointerException(e: NullPointerException): ResponseEntity<AuthResponse> {
        logger.error("❌ Null pointer exception: ${e.message}", e)
        logger.error("Stack trace:", e)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(AuthResponse(
                success = false,
                message = "Internal server error: Null pointer exception"
            ))
    }
}

