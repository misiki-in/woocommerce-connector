export type User = {
	id: string
	phone?: string | null
	email: string
	status?: string | null
	avatar?: string | null
	cartId?: string | null
	verifiedAt?: string | null // ISO timestamp
	currentSignInAt?: string | null // ISO timestamp
	currentSignInIp?: string | null
	firstName?: string | null
	lastName?: string | null
	ipCity?: string | null
	ipCountry?: string | null
	ipLatitude?: number | null
	ipLongitude?: number | null
	ipRegion?: string | null
	ipTimezone?: string | null
	isApproved: boolean
	isDeleted: boolean
	lastSignInAt?: string | null // ISO timestamp
	lastSignInIp?: string | null
	lastSignIn?: string | null // ISO timestamp
	otp?: string | null
	otpAttempt: number
	otpTime?: string | null // ISO timestamp
	password?: string | null // Should not be exposed in select schemas
	isEmailVerified: boolean
	isPhoneVerified: boolean
	role?: string | null
	signInCount: number
	userAuthToken?: string | null
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
}

export type Team = {
	id?: string
	email: string
	phone?: string
	role: string
	vendorId: string
	storeId: string
	avatar?: string
	approved: boolean
	isJoined?: boolean
	isCreator?: boolean
	zips?: string[]
	createdAt?: string
	updatedAt?: string
}

export type Address = {
	id: string // Unique identifier for the address
	active: boolean // Indicates if the address is currently active
	address_1: string | null // Primary address line
	address_2: string | null // Secondary address line (optional)
	city: string | null // City of the address
	country: string | null // Country of the address
	deliveryInstructions: string | null // Optional delivery instructions
	email: string | null // Email associated with the address
	firstName: string | null // First name of the address owner
	isPrimary: boolean // Indicates if this is the primary address
	isResidential: boolean // Indicates if the address is residential
	lastName: string | null // Last name of the address owner
	lat: number | null // Latitude for geolocation
	lng: number | null // Longitude for geolocation
	locality: string | null // Locality of the address
	phone: string | null // Phone number associated with the address
	state: string | null // State or region of the address
	userId: string | null // ID of the user associated with the address
	zip: string | null // Zip or postal code
	createdAt: string // Timestamp of when the address was created
	updatedAt: string // Timestamp of the last update to the address
	countryCode: string | null
}

export type Contact = {
	id: string // Unique identifier for the contact entry
	name: string // Name of the contact person
	email: string // Email address of the contact person
	phone: string | null // Optional phone number
	subject: string | null // Subject of the contact message
	message: string // Content of the message
	createdAt: string // Timestamp of when the contact entry was created
	updatedAt: string // Timestamp of the last update to the entry
}

export type Feedback = {
	id: string // Unique identifier for the feedback
	userId: string // ID of the user providing the feedback
	content: string // Feedback or review content
	rating: number // Rating value, e.g., 1-5
	isActive: boolean // Indicates if the feedback is active/visible
	response: string | null // Optional response to the feedback
	feedbackDate: string // Date feedback was provided
	createdAt: string // Timestamp of when the feedback was created
	updatedAt: string // Timestamp of the last update to the feedback
}

export type Demo = {
	id: string // Unique identifier for the demo request
	name: string // Name of the requester
	email: string // Contact email for the demo request
	phone: string | null // Optional phone number for contact
	company: string | null // Company name associated with the demo request
	message: string | null // Additional details or message for the demo
	isActive: boolean // Indicates if the demo request is active
	isCompleted: boolean // Indicates if the demo has been completed
	demoDate: string | null // Scheduled date for the demo
	createdAt: string // Timestamp of when the demo request was created
	updatedAt: string // Timestamp of the last update to the demo request
}

export type verifyEmail = {
	email: string
	token: string
}

export type Role = {
	name: string
	description: string
	permissions: string[]
	createdAt: string
	updatedAt: string
}
