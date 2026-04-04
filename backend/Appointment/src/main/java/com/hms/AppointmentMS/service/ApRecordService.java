package com.hms.AppointmentMS.service;

import com.hms.AppointmentMS.dto.ApRecordDto;
import com.hms.AppointmentMS.dto.RecordDetails;
import com.hms.AppointmentMS.exception.HmsException;

import java.util.List;

public interface ApRecordService {
    public Long createApRecord(ApRecordDto request) throws HmsException;

    public void updateApRecord(ApRecordDto request) throws HmsException;

    public ApRecordDto getApRecordByAppointmentId(Long appointmentId) throws HmsException;

    public ApRecordDto getApRecordDetailsByAppointmentId(Long appointmentId) throws HmsException;

    public ApRecordDto getApRecordById(Long recordId) throws HmsException;

    List<RecordDetails> getApRecordByPatientId(Long patientId) throws HmsException;
}

