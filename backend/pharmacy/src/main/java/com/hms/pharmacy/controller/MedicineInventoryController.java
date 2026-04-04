package com.hms.pharmacy.controller;

import com.hms.pharmacy.dto.MedicineInventoryDto;
import com.hms.pharmacy.dto.ResponseDto;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.service.MedicineInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/pharmacy/inventory")
@RequiredArgsConstructor
public class MedicineInventoryController {

    private final MedicineInventoryService medicineInventoryService;

    @PostMapping("/add")
    public ResponseEntity<MedicineInventoryDto> addMedicine(@RequestBody MedicineInventoryDto medicineDto) throws HmsException {
        return new ResponseEntity<>(medicineInventoryService.addMedicine(medicineDto),HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<MedicineInventoryDto> getMedicineById(@PathVariable Long id) throws HmsException {
        return new ResponseEntity<>(medicineInventoryService.getMedicineById(id),HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<MedicineInventoryDto>> getAllMedicines() throws HmsException {
        return new ResponseEntity<>(medicineInventoryService.getAllMedicines(),HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> updateMedicine(@RequestBody MedicineInventoryDto medicineDto) throws HmsException {
        medicineInventoryService.updateMedicine(medicineDto);
        return new ResponseEntity<>(new ResponseDto("Medicine Inventory Updated"),HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> deleteMedicine(@PathVariable Long id) throws HmsException {
        medicineInventoryService.deleteMedicine(id);
        return new ResponseEntity<>(new ResponseDto("Medicine Inventory Updated"),HttpStatus.OK);
    }
}
