package com.hms.UserMS.repository;

import com.hms.UserMS.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User>findByEmail(String email);
}
