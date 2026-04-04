package com.hms.AppointmentMS.service;

import com.hms.AppointmentMS.dto.DoctorDto;
import com.hms.AppointmentMS.dto.PatientDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ApiService {

    @Autowired
    private WebClient.Builder webClient;

    public Mono<Boolean> doctorExists(Long id) {
        return webClient.build()
                .get()
                .uri("http://localhost:9100/profile/doctor/exists/"+ id)
                .retrieve()
                .bodyToMono(Boolean.class);
    }

    public Mono<Boolean> patientExists(Long id) {
        return webClient.build()
                .get()
                .uri("http://localhost:9100/profile/patient/exists/"+id)
                .retrieve()
                .bodyToMono(Boolean.class);
    }
    public Mono<PatientDto> getPatientById(Long id) {
        return webClient.build().get()
                .uri("http://localhost:9100/profile/patient/get/" + id)
                .retrieve()
                .bodyToMono(PatientDto.class);
    }

    public Mono<DoctorDto> getDoctorById(Long id) {
        return webClient.build().get()
                .uri("http://localhost:9100/profile/doctor/get/" + id)
                .retrieve()
                .bodyToMono(DoctorDto.class);
    }


}
