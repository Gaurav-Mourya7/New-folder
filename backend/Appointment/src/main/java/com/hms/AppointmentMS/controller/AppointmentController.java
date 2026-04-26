package com.hms.AppointmentMS.controller;

import com.hms.AppointmentMS.dto.AppointmentDetails;
import com.hms.AppointmentMS.dto.AppointmentDto;
import com.hms.AppointmentMS.dto.Status;
import com.hms.AppointmentMS.exception.HmsException;
import com.hms.AppointmentMS.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@CrossOrigin
@RequestMapping("/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/schedule")
    public ResponseEntity<Long> scheduleAppointment(@RequestBody AppointmentDto appointmentDto) throws HmsException {
        appointmentDto.setStatus(Status.SCHEDULED);
        return new ResponseEntity<>(appointmentService.scheduleAppointment(appointmentDto), HttpStatus.CREATED);
    }

    @GetMapping("/get/{appointmentId}")
    public ResponseEntity<AppointmentDto> getAppointmentDetails(@PathVariable Long appointmentId) throws HmsException {
        return new ResponseEntity<>(appointmentService.getAppointmentDetails(appointmentId), HttpStatus.OK);
    }

    @GetMapping("/get/details/{appointmentId}")
    public ResponseEntity<AppointmentDetails> getAppointmentDetailsWithName(@PathVariable Long appointmentId) throws HmsException {
        return new ResponseEntity<>(appointmentService.getAppointmentDetailsWithName(appointmentId),HttpStatus.OK);
    }

    @GetMapping("/getAllByPatient/{patientId}")
    public ResponseEntity<List<AppointmentDetails>> getAllAppointmentsByPatientId(@PathVariable Long patientId) throws HmsException {
        return new ResponseEntity<>(appointmentService.getAllAppointmentByPatientId(patientId),HttpStatus.OK);
    }

    @GetMapping("/getAllByDoctor/{doctorId}")
    public ResponseEntity<List<AppointmentDetails>> getAllAppointmentsByDoctorId(@PathVariable Long doctorId) throws HmsException {
        return new ResponseEntity<>(appointmentService.getAllAppointmentByDoctorId(doctorId),HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<AppointmentDetails>> getAllAppointments() throws HmsException {
        return new ResponseEntity<>(appointmentService.getAllAppointments(), HttpStatus.OK);
    }

    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long appointmentId) throws HmsException {
        appointmentService.cancelAppointment(appointmentId);
        return new ResponseEntity<>("Appointment Cancelled.", HttpStatus.OK);
    }

    @PutMapping("/complete/{appointmentId}")
    public ResponseEntity<String> completeAppointment(@PathVariable Long appointmentId) throws HmsException {
        appointmentService.completeAppointment(appointmentId);
        return new ResponseEntity<>("Appointment Completed.", HttpStatus.OK);
    }

}
