package com.hms.AppointmentMS.service.impl;

import com.hms.AppointmentMS.clients.ProfileClient;
import com.hms.AppointmentMS.dto.ApRecordDto;
import com.hms.AppointmentMS.dto.DoctorName;
import com.hms.AppointmentMS.dto.RecordDetails;
import com.hms.AppointmentMS.entity.ApRecord;
import com.hms.AppointmentMS.exception.HmsException;
import com.hms.AppointmentMS.repository.ApRecordRepository;
import com.hms.AppointmentMS.service.ApRecordService;
import com.hms.AppointmentMS.service.PrescriptionService;
import com.hms.AppointmentMS.utility.StringListConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApRecordServiceImpl implements ApRecordService {

    private final ApRecordRepository apRecordRepository;

    private final PrescriptionService prescriptionService;

    private final ProfileClient profileClient;


    @Override
    public Long createApRecord(ApRecordDto request) throws HmsException {

        Optional<ApRecord> existingRecord =
                apRecordRepository.findByAppointment_Id(request.getAppointmentId());

        if (existingRecord.isPresent()) {
            throw new HmsException("APPOINTMENT_RECORD_ALREADY_EXISTS");
        }
        request.setCreatedAt(LocalDateTime.now());
        Long id = apRecordRepository.save(request.toEntity()).getId();
        if (request.getPrescription() != null) {
            request.getPrescription().setAppointmentId(request.getAppointmentId());
            prescriptionService.savePrescription(request.getPrescription());
        }
        return id;
    }

    @Override
    public void updateApRecord(ApRecordDto request) throws HmsException {
        ApRecord existing = apRecordRepository.findById(request.getId())
                .orElseThrow(() -> new HmsException("AP_RECORD_NOT_FOUND"));

        existing.setNotes(request.getNotes());
        existing.setDiagnosis(request.getDiagnosis());
        existing.setFollowUpDate(request.getFollowUpDate());

        existing.setSymptoms(
                StringListConverter.convertListToString(request.getSymptoms())
        );

        existing.setTests(
                StringListConverter.convertListToString(request.getTests())
        );

        existing.setReferral(request.getReferral());

        if (request.getMediaFileIds() != null) {
            existing.setMediaFileIds(joinMediaIds(request.getMediaFileIds()));
        }

        apRecordRepository.save(existing);
    }

    private static String joinMediaIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return null;
        return ids.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));
    }

    @Override
    public ApRecordDto getApRecordByAppointmentId(Long appointmentId) throws HmsException {
        return apRecordRepository.findByAppointment_Id(appointmentId).orElseThrow(()->new HmsException("APPOINTNMENT_RECORD_NOT_RECORD")).toDto();

    }

    @Override
    public ApRecordDto getApRecordDetailsByAppointmentId(Long appointmentId) throws HmsException {
        ApRecordDto record = apRecordRepository.findByAppointment_Id(appointmentId)
                .orElseThrow(() -> new HmsException("APPOINTMENT_RECORD_NOT_FOUND"))
                .toDto();

        try {
            record.setPrescription(prescriptionService.getPrescriptionByAppointmentId(appointmentId));
        } catch (HmsException e) {
            // Report can exist without a prescription; return record details anyway.
            record.setPrescription(null);
        }

        return record;
    }

    @Override
    public ApRecordDto getApRecordById(Long recordId) throws HmsException {
        return apRecordRepository.findById(recordId).orElseThrow(()->new HmsException("APPOINTNMENT_RECORD_NOT_RECORD")).toDto();
    }

    @Override
    public List<RecordDetails> getApRecordByPatientId(Long patientId) throws HmsException {
        List<ApRecord> records = apRecordRepository.findByPatientId(patientId);
        List<RecordDetails> recordDetails = records.stream()
                .map(ApRecord::toRecordDetails)
                .toList();
        List<Long> doctorIds = recordDetails.stream()
                .map(RecordDetails::getDoctorId)
                .distinct()
                .toList();
        Map<Long, String> doctorMap = Map.of();
        if (!doctorIds.isEmpty()) {
            try {
                List<DoctorName> doctors = profileClient.getDoctorsById(doctorIds);
                doctorMap = doctors.stream()
                        .collect(Collectors.toMap(DoctorName::getId, DoctorName::getName));
            } catch (Exception e) {
                // Still return records; names stay "Unknown Doctor" if ProfileMS is unavailable.
            }
        }

        Map<Long, String> resolvedDoctorMap = doctorMap;
        recordDetails.forEach(record -> {
            String doctorName = resolvedDoctorMap.get(record.getDoctorId());
            if (doctorName != null) {
                record.setDoctorName(doctorName);
            } else {
                record.setDoctorName("Unknown Doctor");
            }
        });

        return recordDetails;
    }
}
