package com.hms.AppointmentMS.dto;

import com.hms.AppointmentMS.entity.Medicine;
import com.hms.AppointmentMS.entity.Prescription;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDto {
    private Long id;
    private String name;
    private Long medicineId;
    private String dosage;
    private String frequency;
    private Integer duration;
    private String route;
    private String type;
    private String instructions;
    private Long prescriptionId;

    public Medicine toEntity() {
        return new Medicine(
                this.id,
                this.name,
                this.medicineId,
                this.dosage,
                this.frequency,
                this.duration,
                this.route,
                this.type,
                this.instructions,
                new Prescription(this.prescriptionId)
        );
    }
}
