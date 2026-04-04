package com.hms.ProfileMS.service.impl;

import com.hms.ProfileMS.dto.DoctorDropDown;
import com.hms.ProfileMS.dto.DoctorDto;
import com.hms.ProfileMS.entity.Doctor;
import com.hms.ProfileMS.repository.DoctorRepository;
import com.hms.ProfileMS.service.DoctorService;
import com.hms.UserMS.exception.HmsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public Long addDoctor(DoctorDto doctorDto) throws HmsException {

        if (doctorDto.getEmail() != null
                && doctorRepository.findByEmailAndDeletedFalse(doctorDto.getEmail()).isPresent()) {
            throw new HmsException("DOCTOR_ALREADY_EXISTS");
        }
        if (doctorDto.getLicenseNo() != null
                && doctorRepository.findByLicenseNoAndDeletedFalse(doctorDto.getLicenseNo()).isPresent()) {
            throw new HmsException("DOCTOR_ALREADY_EXISTS");
        }

       // Force insert (avoid merge/update with detached id coming from other service)
       doctorDto.setId(null);
       return doctorRepository.save(doctorDto.toEntity()).getId();
    }

    @Override
    public DoctorDto getDoctorById(Long id) throws HmsException {

        return doctorRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new HmsException("DOCTOR_NOT_FOUND"))
                .toDTO();
    }

    @Override
    public DoctorDto updateDoctor(DoctorDto doctorDto) throws HmsException {

        Doctor existing = doctorRepository.findByIdAndDeletedFalse(doctorDto.getId())
                .orElseThrow(() -> new HmsException("DOCTOR_NOT_FOUND"));

        if (doctorDto.getName() != null) existing.setName(doctorDto.getName());
        if (doctorDto.getEmail() != null) existing.setEmail(doctorDto.getEmail());
        if (doctorDto.getDob() != null) existing.setDob(doctorDto.getDob());
        if (doctorDto.getPhone() != null) existing.setPhone(doctorDto.getPhone());
        if (doctorDto.getAddress() != null) existing.setAddress(doctorDto.getAddress());
        if (doctorDto.getLicenseNo() != null) existing.setLicenseNo(doctorDto.getLicenseNo());
        if (doctorDto.getSpecialization() != null) {
            existing.setSpecialization(doctorDto.getSpecialization());
        }
        if (doctorDto.getDepartment() != null) existing.setDepartment(doctorDto.getDepartment());
        if (doctorDto.getTotalExp() != null) existing.setTotalExp(doctorDto.getTotalExp());
        if (doctorDto.getPhotoMediaId() != null) existing.setPhotoMediaId(doctorDto.getPhotoMediaId());
        if (doctorDto.getEducation() != null) existing.setEducation(doctorDto.getEducation());

        Doctor saved = doctorRepository.save(existing);

        return saved.toDTO();
    }

    @Override
    public Boolean doctorExists(Long id) throws HmsException {
        return doctorRepository.existsByIdAndDeletedFalse(id);
    }

    @Override
    public List<DoctorDropDown> getDoctorDropDowns() throws HmsException {
        return doctorRepository.getDoctorDropDowns();
    }

    @Override
    public List<DoctorDropDown> getDoctorsById(List<Long> ids) throws HmsException {
        return doctorRepository.findAllDoctorDropDownsByIds(ids);
    }

    @Override
    public List<DoctorDto> getAllDoctors() throws HmsException {
        return doctorRepository.findAllByDeletedFalse().stream().map(Doctor::toDTO).toList();
    }

    @Override
    public void deleteDoctor(Long id) throws HmsException {
        Doctor doctor = doctorRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new HmsException("DOCTOR_NOT_FOUND"));
        freeDoctorUniqueFields(doctor);
        doctor.setDeleted(true);
        doctor.setDeletedAt(LocalDateTime.now());
        doctorRepository.save(doctor);
    }

    private static void freeDoctorUniqueFields(Doctor d) {
        if (d.getEmail() != null && !d.getEmail().isBlank()) {
            d.setEmail(tombstoneValue(d.getEmail(), d.getId(), 255));
        }
        if (d.getLicenseNo() != null && !d.getLicenseNo().isBlank()) {
            d.setLicenseNo(tombstoneValue(d.getLicenseNo(), d.getId(), 64));
        }
    }

    private static String tombstoneValue(String original, Long id, int maxLen) {
        String marker = "|archived|" + id + "|";
        if (original.length() + marker.length() <= maxLen) {
            return original + marker;
        }
        String prefix = "archived_" + id + "_";
        if (prefix.length() >= maxLen) {
            return prefix.substring(0, maxLen);
        }
        int keep = maxLen - prefix.length();
        return prefix + original.substring(0, Math.min(original.length(), keep));
    }

    @Override
    public List<DoctorDto> searchDoctors(String query) throws HmsException {
        if (query == null || query.isBlank()) {
            throw new HmsException("PROFILE_SEARCH_QUERY_REQUIRED");
        }
        String q = query.trim();
        return doctorRepository.searchByKeyword(q).stream().map(Doctor::toDTO).toList();
    }
}
