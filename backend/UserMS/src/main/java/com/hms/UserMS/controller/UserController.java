package com.hms.UserMS.controller;

import com.hms.UserMS.dto.LoginDto;
import com.hms.UserMS.dto.ResponseDto;
import com.hms.UserMS.dto.UserDto;
import com.hms.UserMS.exception.HmsException;
import com.hms.UserMS.jwt.JwtUtil;
import com.hms.UserMS.jwt.MyUserDetailsService;
import com.hms.UserMS.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Validated
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private MyUserDetailsService myUserDetailsService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<ResponseDto> registerUser(@RequestBody @Valid UserDto userDto) throws HmsException{
        userService.registerUser(userDto);
        return new ResponseEntity<>(new ResponseDto("Account created"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> postMethodName(@RequestBody @Valid LoginDto loginDto) throws HmsException{

//        System.out.println(passwordEncoder.matches( ));

        try {
           authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.getEmail(),loginDto.getPassword()));
       }
       catch (AuthenticationException e){
           throw new HmsException("INVALID_CREDENTIALS");
       }
       final UserDetails userDetails = myUserDetailsService.loadUserByUsername(loginDto.getEmail());
       final String jwt = jwtUtil.generateToken(userDetails);
       return new ResponseEntity<>(jwt,HttpStatus.OK);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test(){
        return new ResponseEntity<>("Test", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) throws HmsException {
        UserDto userDto = userService.getUserById(id);
        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        userDto.setId(id);
        userService.updateUser(userDto);
        return new ResponseEntity<>(new ResponseDto("User updated successfully"), HttpStatus.OK);
    }

}
