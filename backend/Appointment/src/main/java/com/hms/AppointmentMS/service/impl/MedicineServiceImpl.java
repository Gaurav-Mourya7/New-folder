package com.hms.AppointmentMS.service.impl;

import com.hms.AppointmentMS.dto.MedicineDto;
import com.hms.AppointmentMS.entity.Medicine;
import com.hms.AppointmentMS.repository.MedicineRepository;
import com.hms.AppointmentMS.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    @Override
    public Long saveMedicine(MedicineDto request) {
        return medicineRepository.save(request.toEntity()).getId();
    }

    @Override
    public List<MedicineDto> saveAllMedicines(List<MedicineDto> requestList) {
        return medicineRepository.saveAll(
                        requestList.stream()
                                .map(MedicineDto::toEntity)
                                .toList()
                ).stream()
                .map(Medicine::toDto)
                .toList();
    }
    @Override
    public List<MedicineDto> getAllMedicinesByPrescriptionId(Long prescriptionId) {
        return medicineRepository.findAllByPrescriptionId(prescriptionId).stream()
                .map(Medicine::toDto)
                .toList();
    }
}
