package com.hms.pharmacy.dto;

import com.hms.pharmacy.entity.Medicine;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDto {
    private Long id;
    private String name;
    private String dosage;
    private MedicineCategory category;
    private MedicineType type;
    private String manufacturer;
    private Integer unitPrice;
    private Integer stock;
    private LocalDateTime createdAt;

    public Medicine toEntity() {
        return new Medicine(
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
}