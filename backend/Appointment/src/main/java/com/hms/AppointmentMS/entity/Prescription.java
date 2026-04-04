package com.hms.AppointmentMS.entity;

import com.hms.AppointmentMS.dto.PrescriptionDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long patientId;
    private Long doctorId;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    private LocalDate prescriptionDate;
    private String notes;

    public Prescription(Long id){
        this.id=id;
    }

    public PrescriptionDto toDto(){
        return new PrescriptionDto(this.id,this.patientId,this.doctorId,
                appointment.getId(), this.prescriptionDate,this.notes,null);
    }

}
