package com.hms.pharmacy.service;

import com.hms.pharmacy.dto.SaleDto;
import com.hms.pharmacy.exception.HmsException;

import java.util.List;

public interface SaleService {

    SaleDto createSale(SaleDto dto) throws HmsException;

    SaleDto getSaleById(Long id) throws HmsException;

    SaleDto updateSale(SaleDto dto) throws HmsException;

    SaleDto getSaleByPrescriptionId(Long prescriptionId) throws HmsException;

    List<SaleDto> getAllSales() throws HmsException;

    void deleteSale(Long id) throws HmsException;
}
