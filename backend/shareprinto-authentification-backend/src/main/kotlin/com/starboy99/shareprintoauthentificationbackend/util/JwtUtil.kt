package com.starboy99.shareprintoauthentificationbackend.util

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*

@Component
class JwtUtil {
    
    @Value("\${jwt.secret}")
    private lateinit var secret: String
    
    @Value("\${jwt.expiration}")
    private var expiration: Long = 0
    
    private fun getSigningKey(): Key {
        return Keys.hmacShaKeyFor(secret.toByteArray())
    }
    
    fun generateToken(userId: String, phone: String, userType: String? = null): String {
        val claims = mutableMapOf<String, Any>()
        claims["userId"] = userId
        claims["phone"] = phone
        if (userType != null) {
            claims["userType"] = userType
        }
        
        return createToken(claims, userId)
    }
    
    private fun createToken(claims: Map<String, Any>, subject: String): String {
        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuedAt(Date(System.currentTimeMillis()))
            .expiration(Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact()
    }
    
    fun extractUserId(token: String): String {
        return extractClaim(token) { it.subject }
    }
    
    fun extractPhone(token: String): String {
        return extractClaim(token) { it["phone"] as String }
    }
    
    fun extractUserType(token: String): String? {
        return extractClaim(token) { it["userType"] as? String }
    }
    
    fun extractExpiration(token: String): Date {
        return extractClaim(token) { it.expiration }
    }
    
    fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T {
        val claims = extractAllClaims(token)
        return claimsResolver(claims)
    }
    
    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(secret.toByteArray()))
            .build()
            .parseSignedClaims(token)
            .payload
    }
    
    fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }
    
    fun validateToken(token: String, userId: String): Boolean {
        val extractedUserId = extractUserId(token)
        return extractedUserId == userId && !isTokenExpired(token)
    }
}
