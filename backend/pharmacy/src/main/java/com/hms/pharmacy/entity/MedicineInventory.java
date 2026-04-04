package com.hms.pharmacy.entity;

import com.hms.pharmacy.dto.MedicineInventoryDto;
import com.hms.pharmacy.dto.StockStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class MedicineInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;
    private String batchNo;
    private int quantity;
    private LocalDate expiryDate;
    private LocalDate addedDate;
    private Integer initialQuantity;
    @Enumerated(EnumType.STRING)
    private StockStatus status;


    public MedicineInventoryDto toDto() {
        return new MedicineInventoryDto(
                this.id,
                this.medicine != null ? this.medicine.getId() : null,
                this.batchNo,
                this.quantity,
                this.expiryDate,
                this.addedDate,
                this.initialQuantity,
                this.status);
    }
}
