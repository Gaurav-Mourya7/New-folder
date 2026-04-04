package com.hms.ProfileMS.dto;

import com.hms.ProfileMS.entity.Patient;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDto {
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private LocalDate dob;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String gender;
    private String emergencyContact;
    private String emergencyPhone;
    @Column(unique = true)
    private String aadhaarNo;
    private BloodGroup bloodGroup;
    private String allergies;
    private String chronicDiseases;
    private Long photoMediaId;

    public Patient toEntity(){
        return new Patient(
                this.id,
                this.name,
                this.email,
                this.dob,
                this.phone,
                this.address,
                this.city,
                this.state,
                this.zipCode,
                this.gender,
                this.emergencyContact,
                this.emergencyPhone,
                this.aadhaarNo,
                this.bloodGroup,
                this.allergies,
                this.chronicDiseases,
                this.photoMediaId,
                false,
                null
        );
    }
}
