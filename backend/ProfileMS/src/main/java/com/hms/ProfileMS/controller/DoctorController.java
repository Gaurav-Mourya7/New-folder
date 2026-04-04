package com.hms.ProfileMS.controller;

import com.hms.ProfileMS.dto.DoctorDropDown;
import com.hms.ProfileMS.dto.DoctorDto;
import com.hms.ProfileMS.service.DoctorService;

import com.hms.UserMS.exception.HmsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/profile/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping("/add")
    public ResponseEntity<Long> addDoctor(@RequestBody DoctorDto doctorDto) throws HmsException {
        return new ResponseEntity<>(doctorService.addDoctor(doctorDto), HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) throws HmsException {
        return new ResponseEntity<>(doctorService.getDoctorById(id), HttpStatus.OK);
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> doctorExists(@PathVariable Long id) throws HmsException{
        return new ResponseEntity<>(doctorService.doctorExists(id), HttpStatus.OK);
    }

    @GetMapping("/dropdowns")
    public ResponseEntity<List<DoctorDropDown>> getDoctorDropDowns() throws HmsException{
        return new ResponseEntity<>(doctorService.getDoctorDropDowns(), HttpStatus.OK);
    }

    @GetMapping("/getDoctorsById")
    public ResponseEntity<List<DoctorDropDown>> getDoctorsById(@RequestParam List<Long> ids) throws HmsException{
        return new ResponseEntity<>(doctorService.getDoctorsById(ids), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<DoctorDto> updateDoctor(@RequestBody DoctorDto doctorDto) throws HmsException {
        return new ResponseEntity<>(doctorService.updateDoctor(doctorDto), HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<DoctorDto>> getAllDoctors() throws HmsException {
        return new ResponseEntity<>(doctorService.getAllDoctors(), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) throws HmsException {
        doctorService.deleteDoctor(id);
        return new ResponseEntity<>("Doctor archived (soft deleted).", HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorDto>> searchDoctors(@RequestParam("q") String q) throws HmsException {
        return new ResponseEntity<>(doctorService.searchDoctors(q), HttpStatus.OK);
    }
}
