package com.hms.UserMS.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignClientInterceptor implements RequestInterceptor {

    /** Must match Gateway + other services (ProfileMS SecurityConfig). */
    private static final String SECRET_KEY = "692986b394460ccb9f0076f0588c3f061020aa585d748e34a22c2aca86accf6181e1b655d9fa0fa35c9ba5f586962b4be6ce1340a2d50eca108ec8b0c40490b7";

    @Override
    public void apply(RequestTemplate requestTemplate) {
        requestTemplate.header("X-Secret-Key", SECRET_KEY);
    }
}
