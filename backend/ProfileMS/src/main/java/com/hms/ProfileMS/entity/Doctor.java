package com.hms.ProfileMS.entity;


import com.hms.ProfileMS.dto.DoctorDto;
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
public class Doctor {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private LocalDate dob;
    private String phone;
    private String address;
    @Column(unique = true)
    private String licenseNo;
    private String specialization;
    private String department;
    private Integer totalExp;
    private Long photoMediaId;
    private String education;

    @Column(nullable = false)
    private boolean deleted = false;

    private LocalDateTime deletedAt;

    public DoctorDto toDTO() {
        return new DoctorDto(this.id, this.name, this.email, this.dob, this.phone,
                this.address, this.licenseNo, this.specialization, this.department, this.totalExp, this.photoMediaId, this.education);
    }
}
