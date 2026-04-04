package com.hms.pharmacy.controller;

import com.hms.pharmacy.dto.MedicineDto;
import com.hms.pharmacy.dto.ResponseDto;
import com.hms.pharmacy.exception.HmsException;
import com.hms.pharmacy.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/pharmacy/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping("/add")
    public ResponseEntity<MedicineDto> addMedicine(@RequestBody MedicineDto medicineDto) throws HmsException {
        return new ResponseEntity<>(medicineService.addMedicine(medicineDto),HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<MedicineDto> getMedicineById(@PathVariable Long id) throws HmsException {
        return new ResponseEntity<>(medicineService.getMedicineById(id),HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<MedicineDto>> getAllMedicines() throws HmsException {
        return new ResponseEntity<>(medicineService.getAllMedicines(),HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> updateMedicine(@RequestBody MedicineDto medicineDto) throws HmsException {
        medicineService.updateMedicine(medicineDto);
        return new ResponseEntity<>(new ResponseDto("Medicine Updated"),HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> deleteMedicine(@PathVariable Long id) throws HmsException {
        medicineService.deleteMedicine(id);
        return new ResponseEntity<>(new ResponseDto("Medicine Deleted"), HttpStatus.OK);
    }
}
