package com.hms.AppointmentMS.entity;

import com.hms.AppointmentMS.dto.AppointmentDto;
import com.hms.AppointmentMS.dto.Status;
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
@Entity
public class Appointment {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentTime;
    private Status status;
    private String reason;
    private String notes;

    public Appointment(Long id) {
        this.id=id;

    }

    public AppointmentDto toDTO() {
        return new AppointmentDto(
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
