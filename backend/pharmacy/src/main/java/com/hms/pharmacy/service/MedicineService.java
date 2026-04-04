package com.hms.pharmacy.service;

import com.hms.pharmacy.dto.MedicineDto;
import com.hms.pharmacy.exception.HmsException;

import java.util.List;

public interface MedicineService {

    public MedicineDto addMedicine(MedicineDto medicineDto) throws HmsException;

    public MedicineDto getMedicineById(Long id) throws HmsException;

    public MedicineDto updateMedicine(MedicineDto medicineDto) throws HmsException;

    public List<MedicineDto> getAllMedicines() throws HmsException;

    public Integer getStockById(Long id) throws HmsException;

    public Integer addStock(Long id,Integer quantity) throws HmsException;

    public Integer removeStock(Long id,Integer quantity) throws HmsException;

    public void deleteMedicine(Long id) throws HmsException;
}