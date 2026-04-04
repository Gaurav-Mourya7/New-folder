package com.hms.UserMS.utility;

import com.hms.UserMS.exception.HmsException;
import feign.FeignException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;


@RestControllerAdvice
public class ExceptionControllerAdvice {

    @Autowired
    Environment environment;

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorInfo> feignExceptionHandler(FeignException e){
        String msg = e.contentUTF8();
        if (msg == null || msg.isBlank()) msg = e.getMessage();
        int status = e.status() > 0 ? e.status() : HttpStatus.INTERNAL_SERVER_ERROR.value();
        ErrorInfo error = new ErrorInfo(msg, status, LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.valueOf(Math.min(Math.max(status, 400), 599)));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorInfo> exceptionHandler(Exception e){
        String msg = e.getMessage();
        if (msg == null || msg.isBlank()) msg = "Some error occurred.";
        ErrorInfo error = new ErrorInfo(msg, HttpStatus.INTERNAL_SERVER_ERROR.value(), LocalDateTime.now());
        return new ResponseEntity<>(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(HmsException.class)
    public ResponseEntity<ErrorInfo> HmsExceptionHandler(HmsException e){
        String msg = environment.getProperty(e.getMessage());
        if (msg == null || msg.isBlank()) msg = e.getMessage();
        ErrorInfo error = new ErrorInfo(msg, HttpStatus.BAD_REQUEST.value(), LocalDateTime.now());
        return new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    public ResponseEntity<ErrorInfo> handleValidationExceptions(Exception e){
        String errorMsg;
        if (e instanceof MethodArgumentNotValidException manv){
            errorMsg = manv.getBindingResult().getAllErrors().stream().map(ObjectError::getDefaultMessage).collect(Collectors.joining(","));
        }
        else {
            ConstraintViolationException cve = (ConstraintViolationException) e;
            errorMsg = cve.getConstraintViolations().stream().map(ConstraintViolation::getMessage).collect(Collectors.joining(","));
        }
        ErrorInfo error = new ErrorInfo(errorMsg,HttpStatus.BAD_REQUEST.value(),LocalDateTime.now());
        return new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);
    }
}
