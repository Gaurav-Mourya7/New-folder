package com.hms.AppointmentMS.service;

import com.hms.AppointmentMS.dto.MedicineDto;

import java.util.List;

public interface MedicineService {

    Long saveMedicine(MedicineDto request);

    List<MedicineDto> saveAllMedicines(List<MedicineDto> requestList);

    List<MedicineDto> getAllMedicinesByPrescriptionId(Long prescriptionId);
}