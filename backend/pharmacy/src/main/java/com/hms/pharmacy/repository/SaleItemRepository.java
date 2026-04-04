package com.hms.pharmacy.repository;

import com.hms.pharmacy.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem,Long> {

    List<SaleItem> findBySaleId(Long saleId);

    List<SaleItem> findByMedicineId(Long medicineId);
}
