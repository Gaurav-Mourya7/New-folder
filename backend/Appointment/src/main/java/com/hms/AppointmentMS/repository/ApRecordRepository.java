package com.hms.AppointmentMS.repository;

import com.hms.AppointmentMS.entity.ApRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ApRecordRepository extends JpaRepository<ApRecord,Long> {

    Optional<ApRecord> findByAppointment_Id(Long appointmentId);

    List<ApRecord> findByPatientId(Long patientId);
}
