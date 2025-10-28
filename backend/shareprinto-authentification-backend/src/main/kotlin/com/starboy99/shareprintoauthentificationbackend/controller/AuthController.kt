package com.starboy99.shareprintoauthentificationbackend.controller

import com.starboy99.shareprintoauthentificationbackend.dto.*
import com.starboy99.shareprintoauthentificationbackend.service.AuthService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
@CrossOrigin(
    origins = ["http://localhost:9002", "http://localhost:3000", "http://localhost:3003", "http://127.0.0.1:9002", "http://127.0.0.1:3000", "http://127.0.0.1:3003"],
    allowCredentials = "true",
    methods = [RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS],
    allowedHeaders = ["Content-Type", "Authorization", "X-Requested-With"]
)
class AuthController(
    private val authService: AuthService
) {
    
    @GetMapping
    fun getHealth(): Map<String, String> {
        return mapOf("message" to "Auth service is running.")
    }
    
    @GetMapping("/test")
    fun test(): Map<String, String> {
        return mapOf("message" to "Test endpoint working", "service" to "AuthService injected successfully")
    }
    
    @PostMapping("/create-test-user")
    fun createTestUser(): AuthResponse {
        return authService.createTestUser()
    }
    
    @PostMapping("/send-otp")
    fun sendOtp(@RequestBody request: SendOtpRequest) = authService.sendOtp(request)
    
    @PostMapping("/verify-otp")
    fun verifyOtp(@RequestBody request: VerifyOtpRequest) = authService.verifyOtp(request)
    
    @PostMapping("/update-name")
    fun updateName(@RequestBody request: UpdateNameRequest) = authService.updateName(request)
    
    @PostMapping("/update-avatar")
    fun updateAvatar(@RequestBody request: UpdateAvatarRequest) = authService.updateAvatar(request)
    
    @PostMapping("/update-password")
    fun updatePassword(@RequestBody request: UpdatePasswordRequest) = authService.updatePassword(request)
    
    @PostMapping("/update-digital-code")
    fun updateDigitalCode(@RequestBody request: UpdateDigitalCodeRequest) = authService.updateDigitalCode(request)
    
    @PostMapping("/update-email")
    fun updateEmail(@RequestBody request: UpdateEmailRequest) = authService.updateEmail(request)
    
    @PostMapping("/update-printer-brand")
    fun updatePrinterBrand(@RequestBody request: UpdatePrinterBrandRequest) = authService.updatePrinterBrand(request)
    
    @PostMapping("/update-printer-model")
    fun updatePrinterModel(@RequestBody request: UpdatePrinterModelRequest) = authService.updatePrinterModel(request)
    
    @PostMapping("/add-printer")
    fun addPrinter(@RequestBody request: AddPrinterRequest) = authService.addPrinter(request)
    
    @PostMapping("/update-printer")
    fun updatePrinter(@RequestBody request: UpdatePrinterRequest) = authService.updatePrinter(request)
    
    @PostMapping("/delete-printer")
    fun deletePrinter(@RequestBody request: DeletePrinterRequest) = authService.deletePrinter(request)
    
    @PostMapping("/toggle-printer-online")
    fun togglePrinterOnline(@RequestBody request: TogglePrinterOnlineRequest) = authService.togglePrinterOnline(request)
    
    @PostMapping("/update-location")
    fun updateLocation(@RequestBody request: UpdateLocationRequest) = authService.updateLocation(request)
    
    @PostMapping("/complete-registration")
    fun completeRegistration(@RequestBody request: CompleteRegistrationRequest) = authService.completeRegistration(request)
    
    @PostMapping("/update-score")
    fun updateScore(@RequestBody request: UpdateScoreRequest) = authService.updateScore(request)
    
    @PostMapping("/update-online-status")
    fun updateOnlineStatus(@RequestBody request: UpdateOnlineStatusRequest) = authService.updateOnlineStatus(request)
    
    @PostMapping("/update-last-seen")
    fun updateLastSeen(@RequestBody request: UpdateLastSeenRequest) = authService.updateLastSeen(request)
    
    @PostMapping("/update-user-type")
    fun updateUserType(@RequestBody request: UpdateUserTypeRequest) = authService.updateUserType(request)
    
    @PostMapping("/update-user")
    fun updateUser(@RequestBody request: UpdateUserRequest) = authService.updateUser(request)
    
    @PostMapping("/update-user-online-status")
    fun updateUserOnlineStatus(@RequestBody request: UpdateUserOnlineStatusRequest) = authService.updateUserOnlineStatus(request)
    
    @PostMapping("/update-user-available-status")
    fun updateUserAvailableStatus(@RequestBody request: UpdateUserAvailableStatusRequest) = authService.updateUserAvailableStatus(request)
    
    @PostMapping("/delete-user")
    fun deleteUser(@RequestBody request: DeleteUserRequest) = authService.deleteUser(request)
    
    @PostMapping("/signin")
    fun signin(@RequestBody request: SigninRequest) = authService.signin(request)
    
    @GetMapping("/user/{phone}")
    fun getUserByPhone(@PathVariable phone: String) = authService.getUserByPhone(phone)
    
    @GetMapping("/users/farmers")
    fun getAllFarmers(@RequestParam(required = false) city: String?) = 
        if (city != null) authService.getFarmersByCity(city) else authService.getAllFarmers()
    
    @GetMapping("/users")
    fun getAllUsers() = authService.getAllUsers()
    
    @PostMapping("/create-user")
    fun createUser(@RequestBody request: CreateUserRequest) = authService.createUser(request)
    
    @PostMapping("/test-kafka")
    fun testKafka(): Map<String, String> {
        return authService.testKafka()
    }
}
