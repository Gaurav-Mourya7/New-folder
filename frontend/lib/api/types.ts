export type Role = "PATIENT" | "DOCTOR" | "ADMIN" | string

export interface ResponseDto {
  message: string
}

// -------------------------
// Auth / UserMS
// -------------------------
export interface LoginDto {
  email: string
  password: string
}

export interface UserDto {
  id?: number | null
  name: string
  email: string
  password: string
  role: Role
  profileId?: number | null
}

// -------------------------
// ProfileMS
// -------------------------
export interface PatientDto {
  id?: number | null
  name?: string
  email?: string
  dob?: string | null // LocalDate (YYYY-MM-DD)
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  gender?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  aadhaarNo?: string | null
  bloodGroup?: string | null
  allergies?: string | null
  chronicDiseases?: string | null
  photoMediaId?: number | null
}

export interface DoctorDto {
  id?: number | null
  name?: string
  email?: string
  dob?: string | null // LocalDate
  phone?: string | null
  address?: string | null
  licenseNo?: string | null
  specialization?: string | null
  department?: string | null
  totalExp?: number | null
  photoMediaId?: number | null
  education?: string | null
}

export interface DoctorDropDown {
  id: number
  name: string
}

// -------------------------
// AppointmentMS
// -------------------------
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | string

export interface AppointmentDto {
  id?: number | null
  patientId?: number | null
  doctorId?: number | null
  appointmentTime?: string | null // LocalDateTime (ISO string)
  status?: AppointmentStatus | null
  reason?: string | null
  notes?: string | null
}

export interface AppointmentDetails {
  id: number
  patientId: number
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorId: number
  doctorName: string
  appointmentTime: string
  status: AppointmentStatus
  reason: string
  notes: string
}

export interface AppointmentMedicineDto {
  id?: number
  name?: string
  medicineId?: number
  dosage?: string
  frequency?: string
  duration?: number
  route?: string
  type?: string
  instructions?: string
  prescriptionId?: number
}

export interface PrescriptionDto {
  id?: number
  patientId?: number
  doctorId?: number
  appointmentId?: number
  prescriptionDate?: string // LocalDate
  notes?: string
  medicines?: AppointmentMedicineDto[]
}

export interface ApRecordDto {
  id?: number | null
  patientId?: number | null
  doctorId?: number | null
  appointmentId?: number | null
  symptoms?: string[] | null
  diagnosis?: string | null
  tests?: string[] | null
  notes?: string | null
  referral?: string | null
  followUpDate?: string | null // LocalDate
  createdAt?: string | null // LocalDateTime
  mediaFileIds?: number[] | null
  prescription?: PrescriptionDto | null
}

/** Summary row from GET /appointment/report/getByPatientId/{patientId} */
export interface RecordDetails {
  id?: number | null
  patientId?: number | null
  doctorId?: number | null
  doctorName?: string | null
  appointmentId?: number | null
  symptoms?: string[] | null
  diagnosis?: string | null
  tests?: string[] | null
  notes?: string | null
  referral?: string | null
  followUpDate?: string | null
  createdAt?: string | null
}

// -------------------------
// PharmacyMS
// -------------------------
export interface MedicineDto {
  id?: number | null
  name?: string
  dosage?: string
  category?: string
  type?: string
  manufacturer?: string
  unitPrice?: number
  stock?: number
  createdAt?: string
}

export interface MedicineInventoryDto {
  id?: number | null
  medicineId?: number | null
  batchNo?: string | null
  quantity?: number | null
  expiryDate?: string | null // LocalDate
  addedDate?: string | null // LocalDate
  initialQuantity?: number | null
  status?: string | null
}

export interface SaleDto {
  id?: number | null
  prescriptionId?: number | null
  saleDate?: string | null // LocalDateTime
  totalAmount?: number | null
}

export interface SaleItemDto {
  id?: number | null
  saleId?: number | null
  medicineId?: number | null
  batchNo?: string | null
  quantity?: number | null
  unitPrice?: number | null
}

// -------------------------
// MediaMS
// -------------------------
export interface MediaFileDto {
  id?: number | null
  name?: string
  type?: string
  size?: number
}

