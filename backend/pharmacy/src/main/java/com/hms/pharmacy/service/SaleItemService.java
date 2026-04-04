package com.hms.pharmacy.service;

import com.hms.pharmacy.dto.SaleItemDto;
import com.hms.pharmacy.exception.HmsException;

import java.util.List;

public interface SaleItemService {

    SaleItemDto createSaleItem(SaleItemDto saleItemDto) throws HmsException;

    void createMultipleSaleItem(Long saleId, Long medicineId, List<SaleItemDto> saleItemDtos) throws HmsException;

    SaleItemDto updateSaleItem(SaleItemDto saleItemDto) throws HmsException;

    List<SaleItemDto> getSaleItemsBySaleId(Long saleId) throws HmsException;

    SaleItemDto getSaleItemById(Long id) throws HmsException;
}
