package com.hms.ProfileMS.controller;

import com.hms.ProfileMS.dto.PatientDto;
import com.hms.ProfileMS.service.PatientService;
import com.hms.UserMS.exception.HmsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/profile/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/add")
    public ResponseEntity<Long> addPatient(@RequestBody PatientDto patientDto) throws HmsException {
        return new ResponseEntity<>(patientService.addPatient(patientDto), HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) throws HmsException {

        return new ResponseEntity<>(patientService.getPatientById(id), HttpStatus.OK);
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> patientExists(@PathVariable Long id) throws HmsException{
        return new ResponseEntity<>(patientService.patientExists(id), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<PatientDto> updatePatient(@RequestBody PatientDto patientDto) throws HmsException {
        return new ResponseEntity<>(patientService.updatePatient(patientDto), HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<PatientDto>> getAllPatients() throws HmsException {
        return new ResponseEntity<>(patientService.getAllPatients(), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) throws HmsException {
        patientService.deletePatient(id);
        return new ResponseEntity<>("Patient archived (soft deleted).", HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PatientDto>> searchPatients(@RequestParam("q") String q) throws HmsException {
        return new ResponseEntity<>(patientService.searchPatients(q), HttpStatus.OK);
    }
}
