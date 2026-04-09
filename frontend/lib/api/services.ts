import type {
  AppointmentDetails,
  AppointmentDto,
  ApRecordDto,
  DoctorDropDown,
  DoctorDto,
  MedicineDto,
  MedicineInventoryDto,
  MediaFileDto,
  PatientDto,
  PrescriptionDto,
  RecordDetails,
  Role,
  SaleDto,
  SaleItemDto,
  ResponseDto,
  UserDto,
  LoginDto,
} from "./types"
import { requestBlob, requestJson, requestText } from "./client"

// -------------------------
// Auth / UserMS
// -------------------------
export async function login(payload: LoginDto): Promise<string> {
  return await requestText("/user/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function register(payload: UserDto): Promise<ResponseDto> {
  return await requestJson<ResponseDto>("/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getUser(id: number): Promise<UserDto> {
  return await requestJson<UserDto>(`/user/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function updateUser(id: number, payload: UserDto): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/user/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function toRoleEnum(role: string): Role {
  return role.toUpperCase() as Role
}

// -------------------------
// ProfileMS
// -------------------------
export async function addPatient(payload: PatientDto): Promise<number> {
  const res = await requestJson<number>("/profile/patient/add", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
  return res
}

export async function getPatientById(id: number): Promise<PatientDto> {
  return await requestJson<PatientDto>(`/profile/patient/get/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function patientExists(id: number): Promise<boolean> {
  return await requestJson<boolean>(`/profile/patient/exists/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function updatePatient(payload: PatientDto): Promise<PatientDto> {
  return await requestJson<PatientDto>(`/profile/patient/update`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function getAllPatients(): Promise<PatientDto[]> {
  return await requestJson<PatientDto[]>(`/profile/patient/getAll`, {
    method: "GET",
    auth: true,
  })
}

export async function deletePatient(id: number): Promise<string> {
  return await requestJson<string>(`/profile/patient/delete/${id}`, {
    method: "DELETE",
    auth: true,
  })
}

export async function searchPatients(q: string): Promise<PatientDto[]> {
  return await requestJson<PatientDto[]>(`/profile/patient/search`, {
    method: "GET",
    auth: true,
    query: { q },
  })
}

export async function addDoctor(payload: DoctorDto): Promise<number> {
  const res = await requestJson<number>(`/profile/doctor/add`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
  return res
}

export async function getDoctorById(id: number): Promise<DoctorDto> {
  return await requestJson<DoctorDto>(`/profile/doctor/get/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function doctorExists(id: number): Promise<boolean> {
  return await requestJson<boolean>(`/profile/doctor/exists/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function getDoctorDropDowns(): Promise<DoctorDropDown[]> {
  return await requestJson<DoctorDropDown[]>(`/profile/doctor/dropdowns`, {
    method: "GET",
    auth: true,
  })
}

export async function getDoctorsByIds(ids: number[]): Promise<DoctorDropDown[]> {
  // RequestParam List<Long> => ids=1&ids=2...
  return await requestJson<DoctorDropDown[]>(`/profile/doctor/getDoctorsById`, {
    method: "GET",
    auth: true,
    query: { ids },
  })
}

export async function updateDoctor(payload: DoctorDto): Promise<DoctorDto> {
  return await requestJson<DoctorDto>(`/profile/doctor/update`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function getAllDoctors(): Promise<DoctorDto[]> {
  return await requestJson<DoctorDto[]>(`/profile/doctor/getAll`, {
    method: "GET",
    auth: true,
  })
}

export async function deleteDoctor(id: number): Promise<string> {
  return await requestJson<string>(`/profile/doctor/delete/${id}`, {
    method: "DELETE",
    auth: true,
  })
}

export async function searchDoctors(q: string): Promise<DoctorDto[]> {
  return await requestJson<DoctorDto[]>(`/profile/doctor/search`, {
    method: "GET",
    auth: true,
    query: { q },
  })
}

// -------------------------
// AppointmentMS
// -------------------------
export async function scheduleAppointment(payload: AppointmentDto): Promise<number> {
  const res = await requestJson<number>(`/appointment/schedule`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
  return res
}

export async function getAppointmentDetails(appointmentId: number): Promise<any> {
  return await requestJson<any>(`/appointment/get/${appointmentId}`, {
    method: "GET",
    auth: true,
  })
}

export async function getAppointmentDetailsWithName(
  appointmentId: number
): Promise<AppointmentDetails> {
  return await requestJson<AppointmentDetails>(`/appointment/get/details/${appointmentId}`, {
    method: "GET",
    auth: true,
  })
}

export async function getAllAppointmentsByPatient(patientId: number): Promise<AppointmentDetails[]> {
  return await requestJson<AppointmentDetails[]>(`/appointment/getAllByPatient/${patientId}`, {
    method: "GET",
    auth: true,
  })
}

export async function getAllAppointmentsByDoctor(doctorId: number): Promise<AppointmentDetails[]> {
  return await requestJson<AppointmentDetails[]>(`/appointment/getAllByDoctor/${doctorId}`, {
    method: "GET",
    auth: true,
  })
}

export async function cancelAppointment(appointmentId: number): Promise<string> {
  return await requestJson<string>(`/appointment/cancel/${appointmentId}`, {
    method: "PUT",
    auth: true,
  })
}

export async function completeAppointment(appointmentId: number): Promise<string> {
  return await requestJson<string>(`/appointment/complete/${appointmentId}`, {
    method: "PUT",
    auth: true,
  })
}

// -------------------------
// Appointment Report
// -------------------------
export async function createApRecord(payload: ApRecordDto): Promise<number> {
  return await requestJson<number>(`/appointment/report/create`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function getApRecordByAppointmentId(appointmentId: number): Promise<ApRecordDto> {
  return await requestJson<ApRecordDto>(`/appointment/report/getByAppointmentId/${appointmentId}`, {
    method: "GET",
    auth: true,
  })
}

export async function getApRecordDetailsByAppointmentId(
  appointmentId: number
): Promise<ApRecordDto> {
  return await requestJson<ApRecordDto>(
    `/appointment/report/getDetailsByAppointmentId/${appointmentId}`,
    {
      method: "GET",
      auth: true,
    }
  )
}

export async function getApRecordByRecordId(recordId: number): Promise<ApRecordDto> {
  return await requestJson<ApRecordDto>(`/appointment/report/getByRecordId/${recordId}`, {
    method: "GET",
    auth: true,
  })
}

export async function getApRecordsByPatientId(patientId: number): Promise<RecordDetails[]> {
  return await requestJson<RecordDetails[]>(`/appointment/report/getByPatientId/${patientId}`, {
    method: "GET",
    auth: true,
  })
}

export async function updateApRecord(payload: ApRecordDto): Promise<string> {
  return await requestJson<string>(`/appointment/report/update`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

// -------------------------
// Pharmacy
// -------------------------
export async function addMedicine(payload: MedicineDto): Promise<MedicineDto> {
  return await requestJson<MedicineDto>(`/pharmacy/medicines/add`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function getMedicineById(id: number): Promise<MedicineDto> {
  return await requestJson<MedicineDto>(`/pharmacy/medicines/get/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function getAllMedicines(): Promise<MedicineDto[]> {
  return await requestJson<MedicineDto[]>(`/pharmacy/medicines/getAll`, {
    method: "GET",
    auth: true,
  })
}

export async function updateMedicine(payload: MedicineDto): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/pharmacy/medicines/update`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function deleteMedicine(id: number): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/pharmacy/medicines/delete/${id}`, {
    method: "DELETE",
    auth: true,
  })
}

export async function addMedicineInventory(payload: MedicineInventoryDto): Promise<MedicineInventoryDto> {
  return await requestJson<MedicineInventoryDto>(`/pharmacy/inventory/add`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function getMedicineInventoryById(id: number): Promise<MedicineInventoryDto> {
  return await requestJson<MedicineInventoryDto>(`/pharmacy/inventory/get/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function getAllMedicineInventory(): Promise<MedicineInventoryDto[]> {
  return await requestJson<MedicineInventoryDto[]>(`/pharmacy/inventory/getAll`, {
    method: "GET",
    auth: true,
  })
}

export async function updateMedicineInventory(payload: MedicineInventoryDto): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/pharmacy/inventory/update`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function deleteMedicineInventory(id: number): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/pharmacy/inventory/delete/${id}`, {
    method: "DELETE",
    auth: true,
  })
}

export async function createSale(payload: SaleDto): Promise<SaleDto> {
  return await requestJson<SaleDto>(`/pharmacy/sales/create`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function getSaleById(id: number): Promise<SaleDto> {
  return await requestJson<SaleDto>(`/pharmacy/sales/get/${id}`, {
    method: "GET",
    auth: true,
  })
}

export async function getSaleItemsBySaleId(saleId: number): Promise<SaleItemDto[]> {
  return await requestJson<SaleItemDto[]>(`/pharmacy/sales/getSaleitems/${saleId}`, {
    method: "GET",
    auth: true,
  })
}

export async function getAllSales(): Promise<SaleDto[]> {
  return await requestJson<SaleDto[]>(`/pharmacy/sales/getAll`, {
    method: "GET",
    auth: true,
  })
}

export async function updateSale(payload: SaleDto): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/pharmacy/sales/update`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export async function deleteSale(id: number): Promise<ResponseDto> {
  return await requestJson<ResponseDto>(`/pharmacy/sales/delete/${id}`, {
    method: "DELETE",
    auth: true,
  })
}

// -------------------------
// MediaMS
// -------------------------
export async function uploadFile(file: File): Promise<MediaFileDto> {
  const formData = new FormData()
  formData.append("file", file)

  return await requestJson<MediaFileDto>(`/media/upload`, {
    method: "POST",
    auth: true,
    body: formData,
  })
}

export async function getFile(id: number): Promise<Blob> {
  return await requestBlob(`/media/${id}`, {
    method: "GET",
    auth: true,
  })
}

// Keep TS happy when a page doesn’t care about a specific DTO.
export type { PrescriptionDto }

