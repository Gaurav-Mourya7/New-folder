package com.hms.pharmacy.service.Impl;

import com.hms.pharmacy.dto.SaleItemDto;
import com.hms.pharmacy.entity.SaleItem;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.repository.SaleItemRepository;
import com.hms.pharmacy.service.SaleItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleItemServiceImpl implements SaleItemService {

    private final SaleItemRepository saleItemRepository;

    @Override
    public SaleItemDto createSaleItem(SaleItemDto saleItemDto) throws HmsException {
        return saleItemRepository.save(saleItemDto.toEntity()).toDto();
    }

    @Override
    public void createMultipleSaleItem(Long saleId, Long medicineId,List<SaleItemDto> saleItemDtos) throws HmsException {

        saleItemDtos.stream().map((x) -> {

            x.setSaleId(saleId);
            x.setMedicineId(x.getMedicineId());

            return x.toEntity();

        }).forEach(saleItemRepository::save);
    }

    @Override
    public SaleItemDto updateSaleItem(SaleItemDto saleItemDto) throws HmsException {
        SaleItem existingSaleItem =saleItemRepository.findById(saleItemDto.getId()).orElseThrow(() -> new HmsException("SALE_ITEM_NOT_FOUND"));
        existingSaleItem.setQuantity(saleItemDto.getQuantity());
        existingSaleItem.setUnitPrice(saleItemDto.getUnitPrice());
        return saleItemRepository.save(existingSaleItem).toDto();
    }

    @Override
    public List<SaleItemDto> getSaleItemsBySaleId(Long saleId) throws HmsException {
        return saleItemRepository.findBySaleId(saleId).stream().distinct().map(SaleItem::toDto).toList();
    }

    @Override
    public SaleItemDto getSaleItemById(Long id) throws HmsException {
        return saleItemRepository.findById(id).map(SaleItem::toDto).orElseThrow(()->new HmsException("SALE_ITEM_NOT_FOUND"));
    }
}
