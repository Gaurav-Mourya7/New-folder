package com.hms.ProfileMS.service;

import com.hms.ProfileMS.dto.DoctorDropDown;
import com.hms.ProfileMS.dto.DoctorDto;
import com.hms.UserMS.exception.HmsException;

import java.util.List;

public interface DoctorService{
    public Long addDoctor(DoctorDto doctorDto) throws HmsException;
    public DoctorDto getDoctorById(Long id) throws HmsException;
    public DoctorDto updateDoctor(DoctorDto doctorDto) throws HmsException;
    public Boolean doctorExists(Long id) throws HmsException;
    public List<DoctorDropDown> getDoctorDropDowns() throws HmsException;
    public List<DoctorDropDown> getDoctorsById(List<Long> ids) throws HmsException;
    List<DoctorDto> getAllDoctors() throws HmsException;
    void deleteDoctor(Long id) throws HmsException;
    List<DoctorDto> searchDoctors(String query) throws HmsException;
}
