package com.hms.pharmacy.entity;

import com.hms.pharmacy.dto.MedicineCategory;
import com.hms.pharmacy.dto.MedicineDto;
import com.hms.pharmacy.dto.MedicineType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String dosage;
    @Enumerated(EnumType.STRING)
    private MedicineCategory category;
    @Enumerated(EnumType.STRING)
    private MedicineType type;
    private String manufacturer;
    private Integer unitPrice;
    private Integer stock;
    private LocalDateTime createdAt;

    public MedicineDto toDto() {
        return new MedicineDto(
                this.id,
                this.name,
                this.dosage,
                this.category,
                this.type,
                this.manufacturer,
                this.unitPrice,
                this.stock,
                this.createdAt
        );
    }
    public Medicine(Long id) {
        this.id = id;
    }
}