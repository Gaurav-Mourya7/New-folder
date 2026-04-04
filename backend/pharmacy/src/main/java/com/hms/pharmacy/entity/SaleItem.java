package com.hms.pharmacy.entity;

import com.hms.pharmacy.dto.SaleItemDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;
    private String batchNo;
    private Integer quantity;
    private Double unitPrice;

    public SaleItemDto toDto(){
        return new SaleItemDto(
                this.id,
                this.sale != null ? this.sale.getId() : null,
                this.medicine !=null ? this.medicine.getId() : null,
                this.batchNo,
                this.quantity,
                this.unitPrice
        );
    }
}