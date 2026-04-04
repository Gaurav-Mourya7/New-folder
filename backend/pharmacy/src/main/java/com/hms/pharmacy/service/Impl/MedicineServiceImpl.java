package com.hms.pharmacy.service.Impl;

import com.hms.pharmacy.dto.MedicineDto;
import com.hms.pharmacy.entity.Medicine;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.repository.MedicineRepository;
import com.hms.pharmacy.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    @Override
    public MedicineDto addMedicine(MedicineDto medicineDto) throws HmsException {
        Optional<Medicine> optional = medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(medicineDto.getName(),medicineDto.getDosage());

        if (optional.isPresent()) {
            throw new HmsException("MEDICINE_ALREADY_EXISTS");
        }
        medicineDto.setStock(0);
        medicineDto.setCreatedAt(LocalDateTime.now());
        return medicineRepository.save(medicineDto.toEntity()).toDto();
    }

    @Override
    public MedicineDto getMedicineById(Long id) throws HmsException {
        return medicineRepository.findById(id).orElseThrow(()->new HmsException("MEDICINE_NOT_FOUND")).toDto();
    }

    @Override
    public MedicineDto updateMedicine(MedicineDto medicineDto) throws HmsException {
        Medicine existingMedicine = medicineRepository.findById(medicineDto.getId())
                .orElseThrow(() -> new HmsException("MEDICINE_NOT_FOUND"));

        if (!(medicineDto.getName().equalsIgnoreCase(existingMedicine.getName())
                && medicineDto.getDosage().equalsIgnoreCase(existingMedicine.getDosage()))) {

            Optional<Medicine> optional = medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(medicineDto.getName(),medicineDto.getDosage());

            if (optional.isPresent()) {
                throw new HmsException("MEDICINE_ALREADY_EXISTS");
            }
            existingMedicine.setName(medicineDto.getName());
            existingMedicine.setDosage(medicineDto.getDosage());
            existingMedicine.setCategory(medicineDto.getCategory());
            existingMedicine.setType(medicineDto.getType());
            existingMedicine.setManufacturer(medicineDto.getManufacturer());
            existingMedicine.setUnitPrice(medicineDto.getUnitPrice());
            medicineRepository.save(existingMedicine);
        }
        return medicineDto;
    }

    @Override
    public List<MedicineDto> getAllMedicines() throws HmsException {
        return ((List<Medicine>) medicineRepository.findAll()).stream().map(Medicine::toDto).toList();
    }

    @Override
    public Integer getStockById(Long id) throws HmsException {
        return medicineRepository.findStockById(id).orElseThrow(()->new HmsException("MEDICINE_NOT_FOUND"));
    }

    @Override
    public Integer addStock(Long id, Integer quantity) throws HmsException {

        Medicine medicine = medicineRepository.findById(id).orElseThrow(() -> new HmsException("MEDICINE_NOT_FOUND"));

        Integer currentStock = medicine.getStock() != null ? medicine.getStock() : 0;

        medicine.setStock(currentStock + quantity);

        medicineRepository.save(medicine);

        return medicine.getStock();
    }

    @Override
    public Integer removeStock(Long id, Integer quantity) throws HmsException {

        Medicine medicine = medicineRepository.findById(id).orElseThrow(() -> new HmsException("MEDICINE_NOT_FOUND"));

        Integer currentStock = medicine.getStock() != null ? medicine.getStock() : 0;

        if (quantity > currentStock) {
            throw new HmsException("INSUFFICIENT_STOCK");
        }

        medicine.setStock(currentStock - quantity);

        medicineRepository.save(medicine);

        return medicine.getStock();
    }

    @Override
    public void deleteMedicine(Long id) throws HmsException {
        // Ensure stock is consistent before deleting the medicine row.
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new HmsException("MEDICINE_NOT_FOUND"));

        Integer stock = medicine.getStock() != null ? medicine.getStock() : 0;
        if (stock > 0) {
            // Removes stock from medicine inventory logic.
            removeStock(id, stock);
        }

        medicineRepository.deleteById(id);
    }
}
