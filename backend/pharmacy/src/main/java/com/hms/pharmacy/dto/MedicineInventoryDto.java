package com.hms.pharmacy.dto;

import com.hms.pharmacy.entity.Medicine;
import com.hms.pharmacy.entity.MedicineInventory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineInventoryDto {
    private Long id;
    private Long medicineId;
    private String batchNo;
    private Integer quantity;
    private LocalDate expiryDate;
    private LocalDate addedDate;
    private Integer initialQuantity;
    private StockStatus status;

    public MedicineInventory toEntity() {
        return new MedicineInventory(this.id,
                new Medicine(this.medicineId),
                this.batchNo,
                this.quantity,
                this.expiryDate,
                this.addedDate,
                this.initialQuantity,
                this.status);
    }
}
