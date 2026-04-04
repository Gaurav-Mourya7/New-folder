package com.hms.UserMS.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


@Component
public class JwtUtil {

    private static final String SECRET_KEY = "692986b394460ccb9f0076f0588c3f061020aa585d748e34a22c2aca86accf6181e1b655d9fa0fa35c9ba5f586962b4be6ce1340a2d50eca108ec8b0c40490b7";
    private static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60L;

    public String generateToken(UserDetails userDetails){
        Map<String, Object> claims = new HashMap<>();
        CustomUserDetails user = (CustomUserDetails) userDetails;
        claims.put("id",user.getId());
        claims.put("profileId", user.getProfileId());
        claims.put("email",user.getEmail());
        claims.put("role",user.getRoles());
        claims.put("name",user.getName());
        return doGenerateToken(claims,userDetails.getUsername());
    }
    public String doGenerateToken(Map<String,Object> claims,String subject) {

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }
}
