package com.hms.AppointmentMS.dto;

import com.hms.AppointmentMS.entity.Appointment;
import com.hms.AppointmentMS.entity.Prescription;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDto{
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private LocalDate prescriptionDate;
    private String notes;
    private List<MedicineDto> medicines;

    public Prescription toEntity(){
        return new Prescription(this.id,this.patientId,this.doctorId,
                new Appointment(this.appointmentId),this.prescriptionDate,this.notes);
    }
}
