package com.hms.AppointmentMS.service.impl;

import com.hms.AppointmentMS.clients.ProfileClient;
import com.hms.AppointmentMS.dto.*;
import com.hms.AppointmentMS.entity.Appointment;
import com.hms.AppointmentMS.exception.HmsException;
import com.hms.AppointmentMS.repository.AppointmentRepository;
import com.hms.AppointmentMS.service.ApiService;
import com.hms.AppointmentMS.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ApiService apiService;

    @Autowired
    private ProfileClient profileClient;

    @Override
    public Long scheduleAppointment(AppointmentDto appointmentDto) throws HmsException {

        Boolean doctorExists = profileClient.doctorExists(appointmentDto.getDoctorId());
        if (doctorExists == null || !doctorExists){
            throw new HmsException("DOCTOR_NOT_FOUND");
        }

        Boolean patientExists = profileClient.patientExists(appointmentDto.getPatientId());
        if (patientExists == null || !patientExists){
            throw new HmsException("PATIENT_NOT_FOUND");
        }
        appointmentDto.setStatus(Status.SCHEDULED);
        return appointmentRepository.save(appointmentDto.toEntity()).getId();
    }

    @Override
    public void cancelAppointment(Long appointmentId) throws HmsException {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new HmsException("APPOINTMENT_NOT_FOUND"));

        if (appointment.getStatus().equals(Status.CANCELLED)) {
            throw new HmsException("APPOINTMENT_ALREADY_CANCELLED");
        }

        appointment.setStatus(Status.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    public void completeAppointment(Long appointmentId) throws HmsException {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new HmsException("APPOINTMENT_NOT_FOUND"));

        if (appointment.getStatus().equals(Status.CANCELLED)) {
            throw new HmsException("APPOINTMENT_ALREADY_CANCELLED");
        }
        if (appointment.getStatus().equals(Status.COMPLETED)) {
            throw new HmsException("APPOINTMENT_ALREADY_COMPLETED");
        }

        appointment.setStatus(Status.COMPLETED);
        appointmentRepository.save(appointment);
    }

    @Override
    public void rescheduleAppointment(Long appointmentId, String newDateTime) {

    }

    @Override
    public AppointmentDto getAppointmentDetails(Long appointmentId) throws HmsException {

        return appointmentRepository.findById(appointmentId).orElseThrow(()->new HmsException("APPOINTMENT_NOT_FOUND")).toDTO();
    }

    @Override
    public AppointmentDetails getAppointmentDetailsWithName(Long appointmentId) throws HmsException {
        AppointmentDto appointmentDto = appointmentRepository.findById(appointmentId).orElseThrow(()->new HmsException("APPOINTMENT_NOT_FOUND")).toDTO();

        DoctorDto doctorDto = profileClient.getDoctorById(appointmentDto.getDoctorId());
        PatientDto patientDto = profileClient.getPatientById(appointmentDto.getPatientId());

        return new AppointmentDetails(appointmentDto.getId(),
                appointmentDto.getPatientId(), patientDto.getName(), patientDto.getPhone(), patientDto.getEmail(),
                appointmentDto.getDoctorId(), doctorDto.getName(),
                appointmentDto.getAppointmentTime(),appointmentDto.getStatus(),appointmentDto.getReason(), appointmentDto.getNotes());
    }

    @Override
    public List<AppointmentDetails> getAllAppointmentByPatientId(Long patientId) throws HmsException {

        //  patient ek hi hai → ek baar fetch
        PatientDto patientDto = profileClient.getPatientById(patientId);

        return appointmentRepository.findAllByPatientId(patientId)
                .stream()
                .map(appointment -> {

                    //  doctor fetch per appointment
                    DoctorDto doctorDto = profileClient.getDoctorById(appointment.getDoctorId());

                    return new AppointmentDetails(
                            appointment.getId(),

                            // patient info (same for all)
                            patientId,
                            patientDto.getName(),
                            patientDto.getPhone(),
                            patientDto.getEmail(),

                            // doctor info
                            appointment.getDoctorId(),
                            doctorDto.getName(),

                            // appointment info
                            appointment.getAppointmentTime(),
                            appointment.getStatus(),
                            appointment.getReason(),
                            appointment.getNotes()
                    );
                })
                .toList();
    }


    @Override
    public List<AppointmentDetails> getAllAppointmentByDoctorId(Long doctorId) throws HmsException {

        //  doctor ek hi hai → ek baar fetch
        DoctorDto doctorDto = profileClient.getDoctorById(doctorId);

        return appointmentRepository.findAllByDoctorId(doctorId)
                .stream()
                .map(appointment -> {

                    //  patient fetch per appointment
                    PatientDto patientDto = profileClient.getPatientById(appointment.getPatientId());

                    return new AppointmentDetails(
                            appointment.getId(),

                            // patient info
                            appointment.getPatientId(),
                            patientDto.getName(),
                            patientDto.getPhone(),
                            patientDto.getEmail(),

                            // doctor info (same for all)
                            doctorId,
                            doctorDto.getName(),

                            // appointment info
                            appointment.getAppointmentTime(),
                            appointment.getStatus(),
                            appointment.getReason(),
                            appointment.getNotes()
                    );
                })
                .toList();
    }

    @Override
    public List<AppointmentDetails> getAllAppointments() throws HmsException {
        return appointmentRepository.findAll()
                .stream()
                .map(appointment -> {
                    DoctorDto doctorDto = profileClient.getDoctorById(appointment.getDoctorId());
                    PatientDto patientDto = profileClient.getPatientById(appointment.getPatientId());

                    return new AppointmentDetails(
                            appointment.getId(),
                            appointment.getPatientId(),
                            patientDto.getName(),
                            patientDto.getPhone(),
                            patientDto.getEmail(),
                            appointment.getDoctorId(),
                            doctorDto.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getStatus(),
                            appointment.getReason(),
                            appointment.getNotes()
                    );
                })
                .toList();
    }
}

