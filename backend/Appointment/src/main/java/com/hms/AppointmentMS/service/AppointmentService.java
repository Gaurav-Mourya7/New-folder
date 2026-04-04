package com.hms.AppointmentMS.service;

import com.hms.AppointmentMS.dto.AppointmentDetails;
import com.hms.AppointmentMS.dto.AppointmentDto;
import com.hms.AppointmentMS.exception.HmsException;

import java.util.List;

public interface AppointmentService {

    Long scheduleAppointment(AppointmentDto appointmentDto) throws HmsException;

    void cancelAppointment(Long appointmentId) throws HmsException;

    void completeAppointment(Long appointmentId) throws HmsException;

    void rescheduleAppointment(Long appointmentId, String newDateTime);

    AppointmentDto getAppointmentDetails(Long appointmentId) throws HmsException;

    public AppointmentDetails getAppointmentDetailsWithName(Long appointmentId) throws HmsException;

    List <AppointmentDetails> getAllAppointmentByPatientId(Long patientId) throws HmsException;

    List <AppointmentDetails> getAllAppointmentByDoctorId(Long doctorId) throws HmsException;
}
