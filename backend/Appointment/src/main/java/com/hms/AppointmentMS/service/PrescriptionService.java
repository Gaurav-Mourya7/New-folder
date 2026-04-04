package com.hms.AppointmentMS.service;

import com.hms.AppointmentMS.dto.PrescriptionDto;
import com.hms.AppointmentMS.exception.HmsException;

public interface PrescriptionService {

    Long savePrescription(PrescriptionDto request);

    PrescriptionDto getPrescriptionByAppointmentId(Long appointmentId) throws HmsException;

    PrescriptionDto getPrescriptionById(Long prescriptionId) throws HmsException;
}