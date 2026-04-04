package com.hms.ProfileMS.entity;


import com.hms.ProfileMS.dto.BloodGroup;
import com.hms.ProfileMS.dto.PatientDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Patient {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
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
    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;
    private String allergies;
    private String chronicDiseases;
    private Long photoMediaId;

    @Column(nullable = false)
    private boolean deleted = false;

    private LocalDateTime deletedAt;

    public PatientDto toDTO(){
        return new PatientDto(
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
                this.photoMediaId
        );
    }

}