package com.hms.ProfileMS.service.impl;

import com.hms.ProfileMS.dto.PatientDto;
import com.hms.ProfileMS.entity.Patient;
import com.hms.ProfileMS.repository.PatientRepository;
import com.hms.ProfileMS.service.PatientService;
import com.hms.UserMS.exception.HmsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public Long addPatient(PatientDto patientDto) throws HmsException {

        if (patientDto.getEmail() != null
                && patientRepository.findByEmailAndDeletedFalse(patientDto.getEmail()).isPresent()) {
            throw new HmsException("PATIENT_ALREADY_EXISTS");
        }
        if (patientDto.getAadhaarNo() != null
                && patientRepository.findByAadhaarNoAndDeletedFalse(patientDto.getAadhaarNo()).isPresent()) {
            throw new HmsException("PATIENT_ALREADY_EXISTS");
        }

        // Force insert (avoid merge/update with detached id coming from other service)
        patientDto.setId(null);
        return patientRepository.save(patientDto.toEntity()).getId();
    }

    @Override
    public PatientDto getPatientById(Long id) throws HmsException {

        return patientRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new HmsException("PATIENT_NOT_FOUND"))
                .toDTO();
    }

    @Override
    public PatientDto updatePatient(PatientDto patientDto) throws HmsException {

        Patient existing = patientRepository.findByIdAndDeletedFalse(patientDto.getId())
                .orElseThrow(() -> new HmsException("PATIENT_NOT_FOUND"));

        // Null-safe partial update: keep existing value when a field is omitted.
        // This is important for lightweight updates (e.g., photo-only update).
        if (patientDto.getName() != null) existing.setName(patientDto.getName());
        if (patientDto.getEmail() != null) existing.setEmail(patientDto.getEmail());
        if (patientDto.getDob() != null) existing.setDob(patientDto.getDob());
        if (patientDto.getPhone() != null) existing.setPhone(patientDto.getPhone());
        if (patientDto.getAddress() != null) existing.setAddress(patientDto.getAddress());
        if (patientDto.getCity() != null) existing.setCity(patientDto.getCity());
        if (patientDto.getState() != null) existing.setState(patientDto.getState());
        if (patientDto.getZipCode() != null) existing.setZipCode(patientDto.getZipCode());
        if (patientDto.getGender() != null) existing.setGender(patientDto.getGender());
        if (patientDto.getEmergencyContact() != null) existing.setEmergencyContact(patientDto.getEmergencyContact());
        if (patientDto.getEmergencyPhone() != null) existing.setEmergencyPhone(patientDto.getEmergencyPhone());
        if (patientDto.getAadhaarNo() != null) existing.setAadhaarNo(patientDto.getAadhaarNo());
        if (patientDto.getBloodGroup() != null) existing.setBloodGroup(patientDto.getBloodGroup());
        if (patientDto.getAllergies() != null) existing.setAllergies(patientDto.getAllergies());
        if (patientDto.getChronicDiseases() != null) existing.setChronicDiseases(patientDto.getChronicDiseases());
        if (patientDto.getPhotoMediaId() != null) existing.setPhotoMediaId(patientDto.getPhotoMediaId());

        Patient saved = patientRepository.save(existing);

        return saved.toDTO();
    }

    @Override
    public Boolean patientExists(Long id) throws HmsException {
        return patientRepository.existsByIdAndDeletedFalse(id);
    }

    @Override
    public List<PatientDto> getAllPatients() throws HmsException {
        return patientRepository.findAllByDeletedFalse().stream().map(Patient::toDTO).toList();
    }

    @Override
    public void deletePatient(Long id) throws HmsException {
        Patient patient = patientRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new HmsException("PATIENT_NOT_FOUND"));
        freePatientUniqueFields(patient);
        patient.setDeleted(true);
        patient.setDeletedAt(LocalDateTime.now());
        patientRepository.save(patient);
    }

    private static void freePatientUniqueFields(Patient p) {
        if (p.getEmail() != null && !p.getEmail().isBlank()) {
            p.setEmail(tombstoneValue(p.getEmail(), p.getId(), 255));
        }
        if (p.getAadhaarNo() != null && !p.getAadhaarNo().isBlank()) {
            p.setAadhaarNo(tombstoneValue(p.getAadhaarNo(), p.getId(), 64));
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
    public List<PatientDto> searchPatients(String query) throws HmsException {
        if (query == null || query.isBlank()) {
            throw new HmsException("PROFILE_SEARCH_QUERY_REQUIRED");
        }
        String q = query.trim();
        return patientRepository.searchByKeyword(q).stream().map(Patient::toDTO).toList();
    }
}
