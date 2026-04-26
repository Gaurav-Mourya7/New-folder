package com.hms.AppointmentMS.repository;

import com.hms.AppointmentMS.dto.AppointmentDetails;
import com.hms.AppointmentMS.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT new com.hms.AppointmentMS.dto.AppointmentDetails(a.id, a.patientId, null, null, null, a.doctorId, null, a.appointmentTime, a.status, a.reason, a.notes) FROM Appointment a WHERE a.patientId = ?1")
    List<AppointmentDetails> findAllByPatientId(Long patientId);

    @Query("SELECT new com.hms.AppointmentMS.dto.AppointmentDetails(a.id, a.patientId, null, null, null, a.doctorId, null, a.appointmentTime, a.status, a.reason, a.notes) FROM Appointment a WHERE a.doctorId = ?1")
    List<AppointmentDetails> findAllByDoctorId(Long doctorId);

    List<Appointment> findAll();
}