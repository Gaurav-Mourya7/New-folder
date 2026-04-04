package com.hms.pharmacy.service;

import com.hms.pharmacy.dto.MedicineInventoryDto;
import com.hms.pharmacy.exception.HmsException;

import java.util.List;

public interface MedicineInventoryService {

    MedicineInventoryDto addMedicine(MedicineInventoryDto medicine) throws HmsException;

    MedicineInventoryDto getMedicineById(Long id) throws HmsException;

    List<MedicineInventoryDto> getAllMedicines() throws HmsException;

    MedicineInventoryDto updateMedicine(MedicineInventoryDto medicine) throws HmsException;

    void deleteMedicine(Long id) throws HmsException;

    void deleteExpiredMedicine() throws HmsException;
}