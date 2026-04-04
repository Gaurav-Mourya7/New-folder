package com.hms.UserMS.service;

import com.hms.UserMS.dto.Roles;
import com.hms.UserMS.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ApiService {

    @Autowired
    private WebClient.Builder webClient;

    public Mono<Long> addProfile(UserDto userDto) {

        if (userDto.getRole().equals(Roles.DOCTOR)) {
            return webClient.build()
                    .post()
                    .uri("http://localhost:9100/profile/doctor/add")
                    .bodyValue(userDto)
                    .retrieve()
                    .bodyToMono(Long.class);

        } else if (userDto.getRole().equals(Roles.PATIENT)) {
            return webClient.build()
                    .post()
                    .uri("http://localhost:9100/profile/patient/add")
                    .bodyValue(userDto)
                    .retrieve()
                    .bodyToMono(Long.class);
        }
        return Mono.error(new RuntimeException("ROLE_REQUIRED"));
    }
}
