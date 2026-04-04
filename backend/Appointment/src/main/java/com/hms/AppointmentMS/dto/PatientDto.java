package com.hms.AppointmentMS.dto;

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
    @Column(unique = true)
    private String aadhaarNo;
    private BloodGroup bloodGroup;
    private String allergies;
    private String chronicDiseases;


}
