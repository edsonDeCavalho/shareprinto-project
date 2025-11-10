package com.starboy99.shareprintoauthentificationbackend.service

import com.starboy99.shareprintoauthentificationbackend.dto.*
import com.starboy99.shareprintoauthentificationbackend.model.Otp
import com.starboy99.shareprintoauthentificationbackend.model.Printer
import com.starboy99.shareprintoauthentificationbackend.model.User
import com.starboy99.shareprintoauthentificationbackend.repository.OtpRepository
import com.starboy99.shareprintoauthentificationbackend.repository.UserRepository
import com.starboy99.shareprintoauthentificationbackend.util.JwtUtil
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val otpRepository: OtpRepository,
    private val jwtUtil: JwtUtil,
    private val passwordEncoder: BCryptPasswordEncoder,
    private val kafkaProducerService: KafkaProducerService
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)
    
    fun sendOtp(request: SendOtpRequest): AuthResponse {
        // For testing purposes, always use 123456
        val code = "123456"
        
        val otp = Otp(
            phone = request.phone,
            code = code,
            verified = false
        )
        
        otpRepository.save(otp)
        
        // TODO: Send SMS via your provider (e.g., Twilio)
        println("Send OTP $code to phone ${request.phone}")
        
        return AuthResponse(
            success = true,
            message = "OTP sent successfully"
        )
    }
    
    fun verifyOtp(request: VerifyOtpRequest): AuthResponse {
        val otpRecord = otpRepository.findByPhoneAndCodeAndVerifiedFalse(request.phone, request.code)
        
        if (otpRecord == null) {
            return AuthResponse(
                success = false,
                message = "Invalid or expired OTP"
            )
        }
        
        // Mark OTP as verified
        val updatedOtp = otpRecord.copy(verified = true)
        otpRepository.save(updatedOtp)
        
        // Find or create user
        var user = userRepository.findByPhone(request.phone)
        if (user == null) {
            val userId = "USER_${System.currentTimeMillis()}_${UUID.randomUUID().toString().substring(0, 6).uppercase()}"
            user = User(
                userId = userId,
                phone = request.phone
            )
            user = userRepository.save(user)
        }
        
        val token = jwtUtil.generateToken(user.userId, user.phone, user.userType)
        
        return AuthResponse(
            success = true,
            message = "OTP verified successfully",
            token = token
        )
    }
    
    fun updateName(request: UpdateNameRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            firstName = request.firstName,
            lastName = request.lastName,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Name updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateAvatar(request: UpdateAvatarRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        if (!request.avatar.startsWith("data:image/")) {
            return AuthResponse(success = false, message = "Invalid image format. Please upload a valid image.")
        }
        
        val updatedUser = user.copy(
            avatar = request.avatar,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Avatar updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updatePassword(request: UpdatePasswordRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        if (request.password.length < 8) {
            return AuthResponse(success = false, message = "Password must be at least 8 characters long.")
        }
        
        val hashedPassword = passwordEncoder.encode(request.password)
        val updatedUser = user.copy(
            password = hashedPassword,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Password updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateDigitalCode(request: UpdateDigitalCodeRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        if (!request.digitalCode.matches(Regex("\\d{6}"))) {
            return AuthResponse(success = false, message = "Digital code must be exactly 6 digits.")
        }
        
        val hashedDigitalCode = passwordEncoder.encode(request.digitalCode)
        val updatedUser = user.copy(
            digitalCode = hashedDigitalCode,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Digital code updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateEmail(request: UpdateEmailRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val emailRegex = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
        if (!emailRegex.matches(request.email)) {
            return AuthResponse(success = false, message = "Please enter a valid email address.")
        }
        
        val updatedUser = user.copy(
            email = request.email,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Email updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updatePrinterBrand(request: UpdatePrinterBrandRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            printerBrand = request.printerBrand,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Printer brand updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updatePrinterModel(request: UpdatePrinterModelRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            printerModel = request.printerModel,
            buildVolume = request.buildVolume,
            multiColor = request.multiColor,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Printer model updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun addPrinter(request: AddPrinterRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val currentPrinters = user.printers?.toMutableList() ?: mutableListOf()
        val newPrinter = Printer(
            printerId = request.printer.printerId ?: "PRINTER_${System.currentTimeMillis()}_${UUID.randomUUID().toString().substring(0, 6).uppercase()}",
            printerBrand = request.printer.printerBrand,
            printerModel = request.printer.printerModel,
            buildVolume = request.printer.buildVolume,
            multiColor = request.printer.multiColor,
            online = request.printer.online
        )
        
        currentPrinters.add(newPrinter)
        
        val updatedUser = user.copy(
            printers = currentPrinters,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        // Send printer added event
        kafkaProducerService.sendPrinterAddedEvent(
            userId = savedUser.id!!,
            printerData = mapOf(
                "printerId" to newPrinter.printerId,
                "printerBrand" to newPrinter.printerBrand,
                "printerModel" to newPrinter.printerModel,
                "buildVolume" to newPrinter.buildVolume,
                "multiColor" to newPrinter.multiColor,
                "online" to newPrinter.online
            )
        )
        
        return AuthResponse(
            success = true,
            message = "Printer added successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updatePrinter(request: UpdatePrinterRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val currentPrinters = user.printers?.toMutableList() ?: mutableListOf()
        val printerIndex = currentPrinters.indexOfFirst { it.printerId == request.printerId }
        
        if (printerIndex == -1) {
            return AuthResponse(success = false, message = "Printer not found.")
        }
        
        val updatedPrinter = currentPrinters[printerIndex].copy(
            printerBrand = request.printer.printerBrand,
            printerModel = request.printer.printerModel,
            buildVolume = request.printer.buildVolume,
            multiColor = request.printer.multiColor,
            online = request.printer.online
        )
        
        currentPrinters[printerIndex] = updatedPrinter
        
        val updatedUser = user.copy(
            printers = currentPrinters,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        // Send printer updated event
        kafkaProducerService.sendPrinterUpdatedEvent(
            userId = savedUser.id!!,
            printerData = mapOf(
                "printerId" to updatedPrinter.printerId,
                "printerBrand" to updatedPrinter.printerBrand,
                "printerModel" to updatedPrinter.printerModel,
                "buildVolume" to updatedPrinter.buildVolume,
                "multiColor" to updatedPrinter.multiColor,
                "online" to updatedPrinter.online
            )
        )
        
        return AuthResponse(
            success = true,
            message = "Printer updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun deletePrinter(request: DeletePrinterRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val currentPrinters = user.printers?.toMutableList() ?: mutableListOf()
        val initialSize = currentPrinters.size
        currentPrinters.removeAll { it.printerId == request.printerId }
        
        if (currentPrinters.size == initialSize) {
            return AuthResponse(success = false, message = "Printer not found.")
        }
        
        val updatedUser = user.copy(
            printers = currentPrinters,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        // Send printer deleted event
        kafkaProducerService.sendPrinterDeletedEvent(
            userId = savedUser.id!!,
            printerId = request.printerId
        )
        
        return AuthResponse(
            success = true,
            message = "Printer deleted successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun togglePrinterOnline(request: TogglePrinterOnlineRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val currentPrinters = user.printers?.toMutableList() ?: mutableListOf()
        val printerIndex = currentPrinters.indexOfFirst { it.printerId == request.printerId }
        
        if (printerIndex == -1) {
            return AuthResponse(success = false, message = "Printer not found.")
        }
        
        val updatedPrinter = currentPrinters[printerIndex].copy(online = request.online)
        currentPrinters[printerIndex] = updatedPrinter
        
        val updatedUser = user.copy(
            printers = currentPrinters,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Printer ${if (request.online) "set online" else "set offline"} successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateLocation(request: UpdateLocationRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            address = request.address,
            country = request.country,
            city = request.city,
            state = request.state,
            zipCode = request.zipCode,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Location updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun completeRegistration(request: CompleteRegistrationRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val hashedDigitalCode = request.digitalCode?.let { passwordEncoder.encode(it) }
        
        val updatedUser = user.copy(
            firstName = request.firstName,
            lastName = request.lastName,
            email = request.email,
            digitalCode = hashedDigitalCode,
            username = request.username,
            userType = request.userType,
            avatar = request.avatar,
            country = request.country,
            adresseID = request.adresseID,
            printerBrand = request.printerBrand,
            printerPhotos = request.printerPhotos,
            activated = true,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        val token = jwtUtil.generateToken(savedUser.id!!, savedUser.phone, savedUser.userType)
        
        return AuthResponse(
            success = true,
            message = "Registration completed successfully",
            token = token,
            user = savedUser.toUserDto()
        )
    }
    
    fun updateScore(request: UpdateScoreRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            score = request.score,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Score updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateOnlineStatus(request: UpdateOnlineStatusRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updateData = mutableMapOf<String, Any>()
        updateData["online"] = request.online
        if (request.online) {
            updateData["latSeenAt"] = LocalDateTime.now()
        }
        
        val updatedUser = user.copy(
            online = request.online,
            latSeenAt = if (request.online) LocalDateTime.now() else user.latSeenAt,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Online status updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateLastSeen(request: UpdateLastSeenRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            latSeenAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "Last seen timestamp updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateUserType(request: UpdateUserTypeRequest): AuthResponse {
        val user = userRepository.findByPhone(request.phone)
            ?: return AuthResponse(success = false, message = "User not found. Please verify your phone number first.")
        
        val updatedUser = user.copy(
            userType = request.userType,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "User type updated successfully",
            user = savedUser.toUserDto()
        )
    }
    
    fun updateUser(request: UpdateUserRequest): AuthResponse {
        val user = userRepository.findById(request.userId).orElse(null)
            ?: return AuthResponse(success = false, message = "User not found.")
        
        val updatedUser = user.copy(
            firstName = request.userData.firstName ?: user.firstName,
            lastName = request.userData.lastName ?: user.lastName,
            email = request.userData.email ?: user.email,
            phone = request.userData.phone ?: user.phone,
            userType = request.userData.userType ?: user.userType,
            score = request.userData.score ?: user.score,
            online = request.userData.online ?: user.online,
            available = request.userData.available ?: user.available,
            activated = request.userData.activated ?: user.activated,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        // Send user updated event
        kafkaProducerService.sendUserUpdatedEvent(
            userId = savedUser.id!!,
            userData = mapOf<String, Any>(
                "userId" to (savedUser.userId ?: ""),
                "firstName" to (savedUser.firstName ?: ""),
                "lastName" to (savedUser.lastName ?: ""),
                "email" to (savedUser.email ?: ""),
                "phone" to (savedUser.phone ?: ""),
                "userType" to (savedUser.userType ?: ""),
                "city" to (savedUser.city ?: ""),
                "country" to (savedUser.country ?: ""),
                "online" to (savedUser.online ?: false),
                "available" to (savedUser.available ?: false)
            )
        )
        
        return AuthResponse(
            success = true,
            message = "User updated successfully",
            data = savedUser.toUserDto()
        )
    }
    
    fun updateUserOnlineStatus(request: UpdateUserOnlineStatusRequest): AuthResponse {
        val user = userRepository.findById(request.userId).orElse(null)
            ?: return AuthResponse(success = false, message = "User not found.")
        
        val updatedUser = user.copy(
            online = request.online,
            latSeenAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "User online status updated successfully.",
            data = savedUser.toUserDto()
        )
    }
    
    fun updateUserAvailableStatus(request: UpdateUserAvailableStatusRequest): AuthResponse {
        val user = userRepository.findById(request.userId).orElse(null)
            ?: return AuthResponse(success = false, message = "User not found.")
        
        val updatedUser = user.copy(
            available = request.available,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        return AuthResponse(
            success = true,
            message = "User available status updated successfully.",
            data = savedUser.toUserDto()
        )
    }
    
    fun deleteUser(request: DeleteUserRequest): AuthResponse {
        val user = userRepository.findById(request.userId).orElse(null)
            ?: return AuthResponse(success = false, message = "User not found.")
        
        userRepository.deleteById(request.userId)
        
        return AuthResponse(
            success = true,
            message = "User deleted successfully.",
            data = user.toUserDto()
        )
    }
    
    fun signin(request: SigninRequest): AuthResponse {
        // Check if email exists
        val user = userRepository.findByEmail(request.email)
            ?: return AuthResponse(success = false, message = "No account found with this email address.")
        
        // Check if user has a digital code set up
        if (user.digitalCode == null) {
            return AuthResponse(success = false, message = "Please set up your digital code first.")
        }
        
        // Check if digital code matches
        if (!passwordEncoder.matches(request.digitalCode, user.digitalCode)) {
            // Send login failed event
            kafkaProducerService.sendLoginFailedEvent(
                userId = user.userId,
                ipAddress = null, // Could be extracted from request context
                userAgent = null, // Could be extracted from request context
                reason = "Incorrect digital code"
            )
            return AuthResponse(success = false, message = "Incorrect digital code. Please try again.")
        }
        
        val updatedUser = user.copy(
            latSeenAt = LocalDateTime.now(),
            online = true,
            updatedAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        
        // Use userId (not id) and handle nullable email
        val userIdentifier = savedUser.email ?: savedUser.phone
        val token = jwtUtil.generateToken(savedUser.userId, userIdentifier, savedUser.userType)
        
        // Send login success event
        kafkaProducerService.sendLoginSuccessEvent(
            userId = savedUser.userId,
            sessionId = token, // Using token as session ID for simplicity
            ipAddress = null, // Could be extracted from request context
            userAgent = null // Could be extracted from request context
        )
        
        // Send user login event to User-login-topic for orchestrator
        logger.info("🔔 About to send user login event for user: ${savedUser.userId}")
        kafkaProducerService.sendUserLoginEvent(savedUser)
        logger.info("🔔 User login event sent for user: ${savedUser.userId}")
        
        return AuthResponse(
            success = true,
            message = "Sign in successful",
            token = token,
            user = savedUser.toUserDto()
        )
    }
    
    fun getUserByPhone(phone: String): AuthResponse {
        val user = userRepository.findByPhone(phone)
            ?: return AuthResponse(success = false, message = "User not found.")
        
        return AuthResponse(
            success = true,
            message = "User found",
            user = user.toUserDto()
        )
    }
    
    fun getAllUsers(): AuthResponse {
        val users = userRepository.findByActivatedTrue()
        
        return AuthResponse(
            success = true,
            message = "Users retrieved successfully",
            users = users.map { it.toUserDto() }
        )
    }
    
    fun getAllFarmers(): AuthResponse {
        val farmers = userRepository.findByUserTypeAndActivatedTrue("farmer")
        
        return AuthResponse(
            success = true,
            message = "Farmers retrieved successfully",
            farmers = farmers.map { it.toUserDto() }
        )
    }
    
    fun getFarmersByCity(city: String): AuthResponse {
        val farmers = userRepository.findByUserTypeAndActivatedTrueAndCityContainingIgnoreCase("farmer", city)
        
        // Add mock data for testing (same as Node.js implementation)
        val mockFarmers = getMockFarmersByCity(city)
        val allFarmers = farmers.map { it.toUserDto() } + mockFarmers
        
        return AuthResponse(
            success = true,
            message = "Farmers in $city retrieved successfully",
            farmers = allFarmers
        )
    }
    
    fun createUser(request: CreateUserRequest): AuthResponse {
        val existingUser = userRepository.findByPhone(request.phone)
            ?: userRepository.findByEmail(request.email)
        
        if (existingUser != null) {
            return AuthResponse(
                success = false,
                message = "User already exists with this phone number or email address."
            )
        }
        
        val userId = "USER_${System.currentTimeMillis()}_${UUID.randomUUID().toString().substring(0, 6).uppercase()}"
        val hashedDigitalCode = request.digitalCode?.let { passwordEncoder.encode(it) }
        
        val newUser = User(
            userId = userId,
            firstName = request.firstName,
            lastName = request.lastName,
            email = request.email,
            phone = request.phone,
            userType = request.userType,
            digitalCode = hashedDigitalCode,
            address = request.address,
            city = request.city,
            state = request.state,
            zipCode = request.zipCode,
            country = request.country,
            score = 0.0,
            online = false,
            activated = true,
            available = if (request.userType == "farmer") false else false,
            latSeenAt = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(newUser)
        
        // Send user created event
        kafkaProducerService.sendUserCreatedEvent(
            userId = savedUser.id!!,
            userData = mapOf<String, Any>(
                "userId" to (savedUser.userId ?: ""),
                "firstName" to (savedUser.firstName ?: ""),
                "lastName" to (savedUser.lastName ?: ""),
                "email" to (savedUser.email ?: ""),
                "phone" to (savedUser.phone ?: ""),
                "userType" to (savedUser.userType ?: ""),
                "city" to (savedUser.city ?: ""),
                "country" to (savedUser.country ?: "")
            )
        )
        
        return AuthResponse(
            success = true,
            message = "User created successfully.",
            data = savedUser.toUserDto()
        )
    }
    
    private fun getMockFarmersByCity(city: String): List<UserDto> {
        val mockFarmers = mapOf(
            "Paris" to listOf(
                UserDto(
                    id = "mock-paris-1",
                    userId = "jean-dupont-001",
                    firstName = "Jean",
                    lastName = "Dupont",
                    phone = "+33123456789",
                    email = "jean.dupont@example.com",
                    userType = "farmer",
                    online = true,
                    score = 4.8,
                    available = true,
                    printers = listOf(
                        PrinterDto(
                            printerId = "printer-1",
                            printerBrand = "Prusa",
                            printerModel = "i3 MK3S+",
                            buildVolume = "250x210x210mm",
                            multiColor = false,
                            online = true
                        )
                    ),
                    address = "123 Rue de la Paix, Paris",
                    city = "Paris",
                    state = "Île-de-France",
                    zipCode = "75001",
                    country = "France"
                ),
                UserDto(
                    id = "mock-paris-2",
                    userId = "david-chen-001",
                    firstName = "David",
                    lastName = "Chen",
                    phone = "+33123456790",
                    email = "david.chen@example.com",
                    userType = "farmer",
                    online = true,
                    score = 4.9,
                    available = true,
                    printers = listOf(
                        PrinterDto(
                            printerId = "printer-2",
                            printerBrand = "Bambu Lab",
                            printerModel = "X1 Carbon",
                            buildVolume = "256x256x256mm",
                            multiColor = true,
                            online = true
                        )
                    ),
                    address = "789 Boulevard Saint-Germain, Paris",
                    city = "Paris",
                    state = "Île-de-France",
                    zipCode = "75006",
                    country = "France"
                )
            ),
            "Lyon" to listOf(
                UserDto(
                    id = "mock-lyon-1",
                    userId = "pierre-martin-001",
                    firstName = "Pierre",
                    lastName = "Martin",
                    phone = "+33412345678",
                    email = "pierre.martin@example.com",
                    userType = "farmer",
                    online = true,
                    score = 4.9,
                    available = true,
                    printers = listOf(
                        PrinterDto(
                            printerId = "printer-3",
                            printerBrand = "Bambu Lab",
                            printerModel = "P1P",
                            buildVolume = "256x256x256mm",
                            multiColor = true,
                            online = true
                        )
                    ),
                    address = "123 Place Bellecour, Lyon",
                    city = "Lyon",
                    state = "Auvergne-Rhône-Alpes",
                    zipCode = "69002",
                    country = "France"
                )
            )
        )
        
        return mockFarmers[city] ?: emptyList()
    }
    
    private fun User.toUserDto(): UserDto {
        return UserDto(
            id = this.id,
            userId = this.userId,
            phone = this.phone,
            firstName = this.firstName,
            lastName = this.lastName,
            email = this.email,
            userType = this.userType,
            avatar = this.avatar,
            score = this.score,
            online = this.online,
            available = this.available,
            activated = this.activated,
            printers = this.printers?.map { printer ->
                PrinterDto(
                    printerId = printer.printerId,
                    printerBrand = printer.printerBrand,
                    printerModel = printer.printerModel,
                    buildVolume = printer.buildVolume,
                    multiColor = printer.multiColor,
                    online = printer.online
                )
            },
            address = this.address,
            city = this.city,
            state = this.state,
            zipCode = this.zipCode,
            country = this.country,
            createdAt = this.createdAt.toString(),
            lastSeenAt = this.latSeenAt?.toString()
        )
    }
    
    fun createTestUser(): AuthResponse {
        try {
            // Check if test user already exists
            val existingUser = userRepository.findByEmail("test@example.com")
            if (existingUser != null) {
                // Always update the existing test user to be a farmer with printers
                val testPrinters = listOf(
                    Printer(
                        printerId = "PRINTER_${System.currentTimeMillis()}_1",
                        printerBrand = "Bambu Lab",
                        printerModel = "X1 Carbon",
                        buildVolume = "256x256x256mm",
                        multiColor = true,
                        online = true
                    ),
                    Printer(
                        printerId = "PRINTER_${System.currentTimeMillis()}_2",
                        printerBrand = "Prusa",
                        printerModel = "MK4",
                        buildVolume = "250x210x220mm",
                        multiColor = false,
                        online = false
                    ),
                    Printer(
                        printerId = "PRINTER_${System.currentTimeMillis()}_3",
                        printerBrand = "Creality",
                        printerModel = "Ender 3 V2",
                        buildVolume = "220x220x250mm",
                        multiColor = false,
                        online = true
                    ),
                    Printer(
                        printerId = "PRINTER_${System.currentTimeMillis()}_4",
                        printerBrand = "Ultimaker",
                        printerModel = "S5",
                        buildVolume = "330x240x300mm",
                        multiColor = true,
                        online = true
                    ),
                    Printer(
                        printerId = "PRINTER_${System.currentTimeMillis()}_5",
                        printerBrand = "FlashForge",
                        printerModel = "Creator Pro",
                        buildVolume = "227x148x150mm",
                        multiColor = true,
                        online = false
                    ),
                    Printer(
                        printerId = "PRINTER_${System.currentTimeMillis()}_6",
                        printerBrand = "Anycubic",
                        printerModel = "Photon Mono X",
                        buildVolume = "192x120x245mm",
                        multiColor = false,
                        online = true
                    )
                )
                
                val updatedUser = existingUser.copy(
                    firstName = "John",
                    lastName = "Farmer",
                    userType = "farmer",
                    score = 4.8,
                    available = true,
                    address = "123 Farm Road",
                    city = "Farmville",
                    state = "California",
                    zipCode = "90210",
                    country = "USA",
                    printers = testPrinters,
                    updatedAt = LocalDateTime.now()
                )
                
                val savedUser = userRepository.save(updatedUser)
                return AuthResponse(
                    success = true,
                    message = "Test user updated to farmer with ${testPrinters.size} printers",
                    user = savedUser.toUserDto()
                )
            }
            
            // Create test farmer user with multiple printers
            val testPrinters = listOf(
                Printer(
                    printerId = "PRINTER_${System.currentTimeMillis()}_1",
                    printerBrand = "Bambu Lab",
                    printerModel = "X1 Carbon",
                    buildVolume = "256x256x256mm",
                    multiColor = true,
                    online = true
                ),
                Printer(
                    printerId = "PRINTER_${System.currentTimeMillis()}_2",
                    printerBrand = "Prusa",
                    printerModel = "MK4",
                    buildVolume = "250x210x220mm",
                    multiColor = false,
                    online = false
                ),
                Printer(
                    printerId = "PRINTER_${System.currentTimeMillis()}_3",
                    printerBrand = "Creality",
                    printerModel = "Ender 3 V2",
                    buildVolume = "220x220x250mm",
                    multiColor = false,
                    online = true
                ),
                Printer(
                    printerId = "PRINTER_${System.currentTimeMillis()}_4",
                    printerBrand = "Ultimaker",
                    printerModel = "S5",
                    buildVolume = "330x240x300mm",
                    multiColor = true,
                    online = true
                ),
                Printer(
                    printerId = "PRINTER_${System.currentTimeMillis()}_5",
                    printerBrand = "FlashForge",
                    printerModel = "Creator Pro",
                    buildVolume = "227x148x150mm",
                    multiColor = true,
                    online = false
                ),
                Printer(
                    printerId = "PRINTER_${System.currentTimeMillis()}_6",
                    printerBrand = "Anycubic",
                    printerModel = "Photon Mono X",
                    buildVolume = "192x120x245mm",
                    multiColor = false,
                    online = true
                )
            )
            
            val testUser = User(
                userId = "USER_${System.currentTimeMillis()}_TEST",
                phone = "+1234567890",
                firstName = "John",
                lastName = "Farmer",
                email = "test@example.com",
                userType = "farmer",
                digitalCode = passwordEncoder.encode("123456"), // Digital code: 123456
                activated = true,
                online = true,
                available = true,
                score = 4.8,
                address = "123 Farm Road",
                city = "Farmville",
                state = "California",
                zipCode = "90210",
                country = "USA",
                printers = testPrinters,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                latSeenAt = LocalDateTime.now()
            )
            
            val savedUser = userRepository.save(testUser)
            
            return AuthResponse(
                success = true,
                message = "Test user created successfully",
                user = savedUser.toUserDto()
            )
        } catch (e: Exception) {
            return AuthResponse(
                success = false,
                message = "Failed to create test user: ${e.message}"
            )
        }
    }
    
    fun testKafka(): Map<String, String> {
        return try {
            // Get the test user
            val user = userRepository.findByEmail("test@example.com")
            if (user != null) {
                // Send user login event
                logger.info("🧪 Testing Kafka - sending user login event for user: ${user.userId}")
                kafkaProducerService.sendUserLoginEvent(user)
                
                // Also try sending a simple test message
                logger.info("🧪 Testing Kafka - sending simple test message")
                kafkaProducerService.sendSimpleMessage("User-login-topic", "test-key", "Simple test message")
                
                mapOf("status" to "success", "message" to "Kafka message sent for user: ${user.userId}")
            } else {
                mapOf("status" to "error", "message" to "Test user not found")
            }
        } catch (e: Exception) {
            logger.error("🧪 Kafka test failed", e)
            mapOf("status" to "error", "message" to "Error: ${e.message}")
        }
    }
}
