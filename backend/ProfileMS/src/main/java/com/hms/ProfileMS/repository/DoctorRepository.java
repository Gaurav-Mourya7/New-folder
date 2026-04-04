package com.hms.ProfileMS.repository;

import com.hms.ProfileMS.dto.DoctorDropDown;
import com.hms.ProfileMS.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor,Long> {
    Optional<Doctor> findByEmailAndDeletedFalse(String email);

    Optional<Doctor> findByLicenseNoAndDeletedFalse(String licenseNo);

    Optional<Doctor> findByIdAndDeletedFalse(Long id);

    boolean existsByIdAndDeletedFalse(Long id);

    List<Doctor> findAllByDeletedFalse();

    @Query("SELECT d.id AS id, d.name AS name FROM Doctor d WHERE d.deleted = false")
    List<DoctorDropDown> getDoctorDropDowns();

    @Query("SELECT d.id AS id, d.name AS name FROM Doctor d WHERE d.deleted = false AND d.id in ?1")
    List<DoctorDropDown> findAllDoctorDropDownsByIds(List<Long> ids);

    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND ("
            + "LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%')) OR "
            + "LOWER(COALESCE(d.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR "
            + "LOWER(COALESCE(d.specialization, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR "
            + "LOWER(COALESCE(d.department, '')) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Doctor> searchByKeyword(@Param("q") String q);
}
