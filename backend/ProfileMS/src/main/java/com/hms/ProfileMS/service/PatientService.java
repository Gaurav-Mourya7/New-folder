package com.hms.ProfileMS.service;

import com.hms.ProfileMS.dto.PatientDto;
import com.hms.UserMS.exception.HmsException;

import java.util.List;

public interface PatientService {
    public Long addPatient(PatientDto patientDto) throws HmsException;
    public PatientDto getPatientById(Long id) throws HmsException;
    public PatientDto updatePatient(PatientDto patientDto) throws HmsException;
    public Boolean patientExists(Long id) throws HmsException;
    List<PatientDto> getAllPatients() throws HmsException;
    void deletePatient(Long id) throws HmsException;
    List<PatientDto> searchPatients(String query) throws HmsException;
}
