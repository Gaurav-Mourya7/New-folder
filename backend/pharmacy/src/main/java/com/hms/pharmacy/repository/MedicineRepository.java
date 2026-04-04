package com.hms.pharmacy.repository;

import com.hms.pharmacy.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {

    Optional<Medicine>findByNameIgnoreCaseAndDosageIgnoreCase(String name,String dosage);

    Optional<Integer> findStockById(Long id);
}
