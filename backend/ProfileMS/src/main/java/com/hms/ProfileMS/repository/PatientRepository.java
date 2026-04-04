package com.hms.ProfileMS.repository;

import com.hms.ProfileMS.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient,Long> {
    Optional<Patient> findByEmailAndDeletedFalse(String email);

    Optional<Patient> findByAadhaarNoAndDeletedFalse(String aadhaarNo);

    Optional<Patient> findByIdAndDeletedFalse(Long id);

    boolean existsByIdAndDeletedFalse(Long id);

    List<Patient> findAllByDeletedFalse();

    @Query("SELECT p FROM Patient p WHERE p.deleted = false AND ("
            + "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR "
            + "LOWER(COALESCE(p.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR "
            + "COALESCE(p.phone, '') LIKE CONCAT('%', :q, '%'))")
    List<Patient> searchByKeyword(@Param("q") String q);
}


