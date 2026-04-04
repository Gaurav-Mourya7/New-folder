package com.hms.UserMS.jwt;

import com.hms.UserMS.dto.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String username;
    private String password;
    private Roles roles;
    private String name;
    private String email;
    private Long profileId;
    private Collection<? extends GrantedAuthority> authorities;
}