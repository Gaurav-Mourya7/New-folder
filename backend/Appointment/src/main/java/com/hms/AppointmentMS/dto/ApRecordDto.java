package com.hms.AppointmentMS.dto;

import com.hms.AppointmentMS.entity.ApRecord;
import com.hms.AppointmentMS.entity.Appointment;
import com.hms.AppointmentMS.utility.StringListConverter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApRecordDto {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private List<String> symptoms;
    private String diagnosis;
    private List<String> tests;
    private String notes;
    private String referral;
    private LocalDate followUpDate;
    private LocalDateTime createdAt;
    private List<Long> mediaFileIds;
    private PrescriptionDto prescription;

    public ApRecord toEntity() {
        return new ApRecord(
                this.id,
                this.patientId,
                this.doctorId,
                new Appointment(this.appointmentId),
                StringListConverter.convertListToString(this.symptoms),
                this.diagnosis,
                StringListConverter.convertListToString(this.tests),
                this.notes,
                this.referral,
                this.followUpDate,
                this.createdAt,
                joinMediaIds(this.mediaFileIds)
        );
    }

    private static String joinMediaIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return null;
        return ids.stream()
                .map(String::valueOf)
                .collect(java.util.stream.Collectors.joining(","));
    }
}
