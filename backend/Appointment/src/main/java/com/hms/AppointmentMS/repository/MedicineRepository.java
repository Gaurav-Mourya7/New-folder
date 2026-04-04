package com.hms.AppointmentMS.repository;

import com.hms.AppointmentMS.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine,Long> {

    List<Medicine> findAllByPrescriptionId(Long prescriptionId);
}