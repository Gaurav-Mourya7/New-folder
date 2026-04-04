package com.hms.AppointmentMS.controller;

import com.hms.AppointmentMS.dto.ApRecordDto;
import com.hms.AppointmentMS.dto.RecordDetails;
import com.hms.AppointmentMS.exception.HmsException;
import com.hms.AppointmentMS.service.ApRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@Validated
@RequiredArgsConstructor
@RequestMapping("/appointment/report")
public class ApRecordController {

    private final ApRecordService apRecordService;

    @PostMapping("/create")
    public ResponseEntity<Long> createApRecord(@RequestBody ApRecordDto request) throws HmsException {
        return new ResponseEntity<>(apRecordService.createApRecord(request), HttpStatus.CREATED);
    }

    @GetMapping("/getByAppointmentId/{appointmentId}")
    public ResponseEntity<ApRecordDto> getApRecordByAppointmentId(@PathVariable Long appointmentId) throws HmsException {
        return new ResponseEntity<>(apRecordService.getApRecordByAppointmentId(appointmentId),HttpStatus.OK);
    }

    @GetMapping("/getDetailsByAppointmentId/{appointmentId}")
    public ResponseEntity<ApRecordDto> getApRecordDetailsByAppointmentId(@PathVariable Long appointmentId) throws HmsException {
        return new ResponseEntity<>(apRecordService.getApRecordDetailsByAppointmentId(appointmentId),HttpStatus.OK);
    }

    @GetMapping("/getByRecordId/{recordId}")
    public ResponseEntity<ApRecordDto> getApRecordById(@PathVariable Long recordId) throws HmsException {
        return new ResponseEntity<>(apRecordService.getApRecordById(recordId),HttpStatus.OK);
    }

    @GetMapping("/getByPatientId/{patientId}")
    public ResponseEntity<List<RecordDetails>> getApRecordsByPatientId(@PathVariable Long patientId) throws HmsException {
        return new ResponseEntity<>(apRecordService.getApRecordByPatientId(patientId), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateApRecord(@RequestBody ApRecordDto request) throws HmsException {
        System.out.println("Updating ID: " + request.getId());
        apRecordService.updateApRecord(request);
        return new ResponseEntity<>("Appointment Report Updated", HttpStatus.OK);
    }
}
