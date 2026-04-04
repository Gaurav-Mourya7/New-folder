package com.hms.pharmacy.service.Impl;

import com.hms.pharmacy.dto.MedicineInventoryDto;
import com.hms.pharmacy.dto.StockStatus;
import com.hms.pharmacy.entity.MedicineInventory;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.repository.MedicineInventoryRepository;
import com.hms.pharmacy.service.MedicineInventoryService;
import com.hms.pharmacy.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MedicineInventoryServiceImpl implements MedicineInventoryService {

    private final MedicineInventoryRepository medicineInventoryRepository;

    private final MedicineService medicineService;

    @Override
    public MedicineInventoryDto addMedicine(MedicineInventoryDto medicine) throws HmsException {
        medicine.setAddedDate(LocalDate.now());
        medicineService.addStock(medicine.getMedicineId(),medicine.getQuantity());
        medicine.setInitialQuantity(medicine.getQuantity());
        medicine.setStatus(StockStatus.ACTIVE);
        return medicineInventoryRepository.save(medicine.toEntity()).toDto();
    }

    @Override
    public MedicineInventoryDto getMedicineById(Long id) throws HmsException {
        return medicineInventoryRepository.findById(id).orElseThrow(()->new HmsException("INVENTORY_NOT_FOUND")).toDto();
    }

    @Override
    public List<MedicineInventoryDto> getAllMedicines() throws HmsException {
        List<MedicineInventory> inventories =  medicineInventoryRepository.findAll();

        return inventories.stream().map(MedicineInventory::toDto).toList();
    }

    @Override
    public MedicineInventoryDto updateMedicine(MedicineInventoryDto medicine) throws HmsException {
        MedicineInventory existingInventory = medicineInventoryRepository
                .findById(medicine.getId())
                .orElseThrow(() -> new HmsException("INVENTORY_NOT_FOUND"));

        existingInventory.setBatchNo(medicine.getBatchNo());

        if (existingInventory.getQuantity() < medicine.getQuantity()) {

            medicineService.addStock(medicine.getMedicineId(),medicine.getQuantity() - existingInventory.getQuantity());

        } else if (existingInventory.getQuantity() > medicine.getQuantity()) {

            medicineService.removeStock(medicine.getMedicineId(),existingInventory.getQuantity() - medicine.getQuantity());
        }

        existingInventory.setQuantity(medicine.getQuantity());
        existingInventory.setExpiryDate(medicine.getExpiryDate());
        medicine.setInitialQuantity(medicine.getInitialQuantity());

        return medicineInventoryRepository.save(existingInventory).toDto();
    }
        @Override
        public void deleteMedicine(Long id) throws HmsException {

            MedicineInventory existingInventory = medicineInventoryRepository.findById(id).orElseThrow(() -> new HmsException("INVENTORY_NOT_FOUND"));
            Integer qty = existingInventory.getQuantity();
            if (qty != null &&  qty > 0) {

                medicineService.removeStock(existingInventory.getMedicine().getId(),qty);
            }

            medicineInventoryRepository.deleteById(id);
        }

    @Override
    @Scheduled(cron = "0 0 2 * * ?")
    public void deleteExpiredMedicine() throws HmsException {
        List<MedicineInventory> expiredMedicines = medicineInventoryRepository.findByExpiryDateBefore(LocalDate.now());
        for (MedicineInventory medicine : expiredMedicines) {
            medicineService.removeStock(medicine.getMedicine().getId(),medicine.getQuantity());
            this.markExpired(expiredMedicines);
        }
    }


    private void markExpired(List<MedicineInventory> inventories) throws HmsException {
        for (MedicineInventory inventory : inventories){
            inventory.setStatus(StockStatus.EXPIRED);
        }
        medicineInventoryRepository.saveAll(inventories);
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void print(){
        System.out.println("Scheduled task running..");
    }
}


