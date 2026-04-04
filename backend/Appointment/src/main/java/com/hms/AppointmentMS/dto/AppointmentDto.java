package com.hms.AppointmentMS.dto;

import com.hms.AppointmentMS.entity.Appointment;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class AppointmentDto {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentTime;
    private Status status;
    private String reason;
    private String notes;
    public Appointment toEntity() {
        return new Appointment(
                this.id,
                this.patientId,
                this.doctorId,
                this.appointmentTime,
                this.status,
                this.reason,
                this.notes
        );
    }
}
