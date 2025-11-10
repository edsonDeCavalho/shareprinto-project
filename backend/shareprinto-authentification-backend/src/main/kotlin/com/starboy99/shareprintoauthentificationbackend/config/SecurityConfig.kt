package com.starboy99.shareprintoauthentificationbackend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig {
    
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
    
    @Bean
    fun bCryptPasswordEncoder(): BCryptPasswordEncoder {
        return BCryptPasswordEncoder()
    }
    
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        
        // Get allowed origins from environment variable or use defaults
        val allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS")
        val allowedOrigins = if (allowedOriginsEnv != null) {
            allowedOriginsEnv.split(",").map { it.trim() }
        } else {
            listOf(
                "http://localhost:9002",
                "http://localhost:3000", 
                "http://localhost:3003",
                "http://127.0.0.1:9002",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3003",
                "http://51.178.142.95:9002",
                "http://51.178.142.95:3000",
                "http://51.178.142.95:3003"
            )
        }
        
        configuration.allowedOriginPatterns = allowedOrigins
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        configuration.allowedHeaders = listOf("Content-Type", "Authorization", "X-Requested-With")
        configuration.allowCredentials = true
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
    
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { authz ->
                authz.anyRequest().permitAll()
            }
        
        return http.build()
    }
}
