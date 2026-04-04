package com.hms.UserMS.clients;

import com.hms.UserMS.config.FeignClientInterceptor;
import com.hms.UserMS.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name="ProfileMs",configuration = FeignClientInterceptor.class)
public interface ProfileClient {

    @PostMapping("/profile/doctor/add")
    Long addDoctor(@RequestBody UserDto userDto);

    @PostMapping("/profile/patient/add")
    Long addPatient(@RequestBody UserDto userDto);
}
