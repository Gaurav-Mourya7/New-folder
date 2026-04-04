package com.hms.pharmacy.repository;

import com.hms.pharmacy.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale,Long> {

    Boolean existsByPrescriptionId(Long prescriptionId);

    Optional<Sale> findByPrescriptionId(Long prescriptionId);
}
