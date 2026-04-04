package com.hms.UserMS.service.impl;

import com.hms.UserMS.clients.ProfileClient;
import com.hms.UserMS.dto.Roles;
import com.hms.UserMS.dto.UserDto;
import com.hms.UserMS.entity.User;
import com.hms.UserMS.exception.HmsException;
import com.hms.UserMS.repository.UserRepository;
import com.hms.UserMS.service.ApiService;
import com.hms.UserMS.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ApiService apiService;

    @Autowired
    private ProfileClient profileClient;

    @Override
    public void registerUser(UserDto userDto) throws HmsException {
        Optional<User> opt = userRepository.findByEmail(userDto.getEmail());
        if (opt.isPresent()){
            throw new HmsException("USER_ALREADY_EXISTS");
        }
        if (userDto.getRole() == null) {
            throw new HmsException("ROLE_REQUIRED");
        }

        // Save user first, then create profile, then update profileId.
        // This avoids "profile created but user not saved" when userdb fails.
        User toCreate = new User(
                null,
                userDto.getName(),
                userDto.getEmail(),
                passwordEncoder.encode(userDto.getPassword()),
                userDto.getRole(),
                null
        );

        User created = userRepository.save(toCreate);

        try {
            Long profileId = null;
            if (userDto.getRole().equals(Roles.DOCTOR)){
                profileId = profileClient.addDoctor(new UserDto(
                        created.getId(),
                        created.getName(),
                        created.getEmail(),
                        created.getPassword(),
                        created.getRole(),
                        null
                ));
            } else if (userDto.getRole().equals(Roles.PATIENT)) {
                profileId = profileClient.addPatient(new UserDto(
                        created.getId(),
                        created.getName(),
                        created.getEmail(),
                        created.getPassword(),
                        created.getRole(),
                        null
                ));
            }

            created.setProfileId(profileId);
            userRepository.save(created);
        } catch (Exception e) {
            // Best-effort rollback: if profile creation fails, delete the user.
            userRepository.deleteById(created.getId());
            throw e;
        }
    }

    @Override
    public UserDto loginUser(UserDto userDto) throws HmsException {
        User user = userRepository.findById(userDto.getId()).orElseThrow(()->new HmsException("USER_NOT_FOUND"));
        if (!passwordEncoder.matches(userDto.getPassword(), user.getPassword())){
            throw new HmsException("INVALID_CREDENTIALS");
        }
        user.setPassword(null);
        return user.toDTO();
    }

    @Override
    public UserDto getUserById(Long id) throws HmsException {
        return userRepository.findById(id).orElseThrow(()->new HmsException("User Not Found")).toDTO();
    }

    @Override
    public void updateUser(UserDto userDto) {
        throw new UnsupportedOperationException("Unimplemented method 'updated user'");
    }

    @Override
    public UserDto getUser(String email) throws HmsException {
        return userRepository.findByEmail(email).orElseThrow(()->new HmsException("USER_NOT_FOUND")).toDTO();
    }
}
