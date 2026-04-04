package com.hms.UserMS.service;

import com.hms.UserMS.dto.UserDto;
import com.hms.UserMS.exception.HmsException;

public interface UserService {
    public void registerUser(UserDto userDto) throws HmsException;

    public UserDto loginUser(UserDto userDto) throws HmsException;

    public UserDto getUserById(Long id) throws HmsException;

    public void updateUser(UserDto userDto);

    public UserDto getUser(String email) throws HmsException;
}

