package com.hms.pharmacy.service.Impl;

import com.hms.pharmacy.dto.SaleDto;
import com.hms.pharmacy.entity.Sale;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.repository.SaleRepository;
import com.hms.pharmacy.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;

    @Override
    public SaleDto createSale(SaleDto dto) throws HmsException {
        if (saleRepository.existsByPrescriptionId(dto.getPrescriptionId())){
            throw new HmsException("SALES_ALREADY_EXISTS");
        }
        dto.setSaleDate(LocalDateTime.now());
        return saleRepository.save(dto.toEntity()).toDto();
    }

    @Override
    public SaleDto getSaleById(Long id) throws HmsException {
        return saleRepository.findById(id).orElseThrow(()->new HmsException("SALES_NOT_FOUND")).toDto();
    }

    @Override
    public SaleDto updateSale(SaleDto dto) throws HmsException {
        Sale sale = saleRepository.findById(dto.getId()).orElseThrow(() -> new HmsException( "SALE_NOT_FOUND"));
        sale.setSaleDate(dto.getSaleDate());
        sale.setTotalAmount(dto.getTotalAmount());
        return saleRepository.save(sale).toDto();
    }

    @Override
    public SaleDto getSaleByPrescriptionId(Long prescriptionId) throws HmsException {
        return saleRepository.findByPrescriptionId(prescriptionId).orElseThrow(() -> new HmsException( "SALE_NOT_FOUND")).toDto();}

    @Override
    public List<SaleDto> getAllSales() throws HmsException {
        return saleRepository.findAll().stream().map(Sale::toDto).toList();
    }

    @Override
    public void deleteSale(Long id) throws HmsException {
        Sale sale = saleRepository.findById(id).orElseThrow(() -> new HmsException("SALE_NOT_FOUND"));
        saleRepository.delete(sale);
    }
}
