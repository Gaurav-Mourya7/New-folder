package com.hms.AppointmentMS.repository;

import com.hms.AppointmentMS.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription,Long> {

    Optional<Prescription> findByAppointment_Id(Long appointmentId);

    List<Prescription> findAllByPatientId(Long patientId);
}
