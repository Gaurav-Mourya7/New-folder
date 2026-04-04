package com.hms.AppointmentMS.service.impl;

import com.hms.AppointmentMS.dto.PrescriptionDto;
import com.hms.AppointmentMS.exception.HmsException;
import com.hms.AppointmentMS.repository.PrescriptionRepository;
import com.hms.AppointmentMS.service.MedicineService;
import com.hms.AppointmentMS.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    private final MedicineService medicineService;

    @Override
    public Long savePrescription(PrescriptionDto request) {
        Long prescriptionId = prescriptionRepository.save(request.toEntity()).getId();
        request.setPrescriptionDate(LocalDate.now());
        request.getMedicines().forEach(medicine -> medicine.setPrescriptionId(prescriptionId));
        medicineService.saveAllMedicines(request.getMedicines());
        return prescriptionId;
    }

    @Override
    public PrescriptionDto getPrescriptionByAppointmentId(Long appointmentId) throws HmsException {

        PrescriptionDto prescriptionDto =
                prescriptionRepository.findByAppointment_Id(appointmentId)
                        .orElseThrow(() -> new HmsException("PRESCRIPTION_NOT_FOUND")).toDto();

        prescriptionDto.setMedicines(
                medicineService.getAllMedicinesByPrescriptionId(prescriptionDto.getId())
        );

        return prescriptionDto;
    }
    @Override
    public PrescriptionDto getPrescriptionById(Long prescriptionId) throws HmsException {

        PrescriptionDto dto = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new HmsException("PRESCRIPTION_NOT_FOUND"))
                .toDto();

        dto.setMedicines(
                medicineService.getAllMedicinesByPrescriptionId(dto.getId())
        );

        return dto;
    }
}
