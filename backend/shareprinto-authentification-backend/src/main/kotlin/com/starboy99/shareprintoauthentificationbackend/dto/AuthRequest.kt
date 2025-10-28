package com.starboy99.shareprintoauthentificationbackend.dto

data class SendOtpRequest(
    val phone: String
)

data class VerifyOtpRequest(
    val phone: String,
    val code: String
)

data class UpdateNameRequest(
    val phone: String,
    val firstName: String,
    val lastName: String
)

data class UpdateAvatarRequest(
    val phone: String,
    val avatar: String
)

data class UpdatePasswordRequest(
    val phone: String,
    val password: String
)

data class UpdateDigitalCodeRequest(
    val phone: String,
    val digitalCode: String
)

data class UpdateEmailRequest(
    val phone: String,
    val email: String
)

data class UpdatePrinterBrandRequest(
    val phone: String,
    val printerBrand: String
)

data class UpdatePrinterModelRequest(
    val phone: String,
    val printerModel: String,
    val buildVolume: String,
    val multiColor: Boolean
)

data class AddPrinterRequest(
    val phone: String,
    val printer: PrinterDto
)

data class UpdatePrinterRequest(
    val phone: String,
    val printerId: String,
    val printer: PrinterDto
)

data class DeletePrinterRequest(
    val phone: String,
    val printerId: String
)

data class TogglePrinterOnlineRequest(
    val phone: String,
    val printerId: String,
    val online: Boolean
)

data class UpdateLocationRequest(
    val phone: String,
    val address: String,
    val country: String,
    val city: String? = null,
    val state: String? = null,
    val zipCode: String? = null
)

data class CompleteRegistrationRequest(
    val phone: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val digitalCode: String? = null,
    val username: String? = null,
    val userType: String,
    val avatar: String? = null,
    val country: String? = null,
    val adresseID: String? = null,
    val printerBrand: String? = null,
    val printerDimensions: String? = null,
    val printerPhotos: List<String>? = null
)

data class UpdateScoreRequest(
    val phone: String,
    val score: Double
)

data class UpdateOnlineStatusRequest(
    val phone: String,
    val online: Boolean
)

data class UpdateLastSeenRequest(
    val phone: String
)

data class UpdateUserTypeRequest(
    val phone: String,
    val userType: String
)

data class UpdateUserRequest(
    val userId: String,
    val userData: UserUpdateDto
)

data class UpdateUserOnlineStatusRequest(
    val userId: String,
    val online: Boolean
)

data class UpdateUserAvailableStatusRequest(
    val userId: String,
    val available: Boolean
)

data class DeleteUserRequest(
    val userId: String
)

data class SigninRequest(
    val email: String,
    val digitalCode: String
)

data class CreateUserRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val userType: String,
    val digitalCode: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zipCode: String? = null,
    val country: String? = null
)

data class PrinterDto(
    val printerId: String? = null,
    val printerBrand: String,
    val printerModel: String,
    val buildVolume: String,
    val multiColor: Boolean,
    val online: Boolean = true
)

data class UserUpdateDto(
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val userType: String? = null,
    val score: Double? = null,
    val online: Boolean? = null,
    val available: Boolean? = null,
    val activated: Boolean? = null
)
