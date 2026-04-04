package com.hms.UserMS.jwt;

import com.hms.UserMS.dto.UserDto;
import com.hms.UserMS.exception.HmsException;
import com.hms.UserMS.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserService userService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            UserDto dto = userService.getUser(email);
            // username/email/name used for JWT claims and frontend display
            return new CustomUserDetails(
                    dto.getId(),
                    dto.getEmail(),
                    dto.getPassword(),
                    dto.getRole(),
                    dto.getName(),
                    dto.getEmail(),
                    dto.getProfileId(),
                    null
            );
        } catch(HmsException e) {
            e.printStackTrace();
        }
        return null;
    }
}
