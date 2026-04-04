package com.hms.AppointmentMS.entity;

import com.hms.AppointmentMS.dto.ApRecordDto;
import com.hms.AppointmentMS.dto.RecordDetails;
import com.hms.AppointmentMS.utility.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ApRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long patientId;
    private Long doctorId;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    private String symptoms;
    private String diagnosis;
    private String tests;
    private String notes;
    private String referral;
    private LocalDate followUpDate;
    private LocalDateTime createdAt;
    // Comma-separated list of MediaMS file ids
    @Lob
    private String mediaFileIds;

    public ApRecordDto toDto() {
        return new ApRecordDto(
                this.id,
                this.patientId,
                this.doctorId,
                this.appointment.getId(),
                StringListConverter.convertStringToList(this.symptoms),
                this.diagnosis,
                StringListConverter.convertStringToList(this.tests),
                this.notes,
                this.referral,
                this.followUpDate,
                this.createdAt,
                splitMediaIds(this.mediaFileIds),
                null
        );
    }

    private static List<Long> splitMediaIds(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return List.of(csv.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();
    }

    public RecordDetails toRecordDetails() {
        return new RecordDetails(
                this.id,
                this.patientId,
                this.doctorId,
                null,
                this.appointment.getId(),
                StringListConverter.convertStringToList(this.symptoms),
                this.diagnosis,
                StringListConverter.convertStringToList(this.tests),
                this.notes,
                this.referral,
                this.followUpDate,
                this.createdAt
        );
    }
}
